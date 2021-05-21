import fetch from "node-fetch"

import { captureException } from "@sentry/node"

import { Logger } from "./_logger"
import { updateBasedOnManualRules } from "./_manual-rules"
import { Knex } from "./_pg"
import {
  BodyItem,
  OfflineDatabaseData,
  OfflineDatabaseEntry,
  QueryParamInput,
  Relation,
  Source,
} from "./_types"

const isDefined = <T>(obj: T | null | undefined): obj is T => obj != null

const chunk = <T>(arr: T[], size: number) =>
  arr.reduce((all, one, i) => {
    const ch = Math.floor(i / size)
    all[ch] = [...(all[ch] ?? []), one]
    return all
  }, [] as T[][])

export class ArmData {
  private static regexes = {
    anilist: /anilist.co\/anime\/(\d+)$/,
    anidb: /anidb.net\/a(?:nime\/)?(\d+)$/,
    mal: /myanimelist.net\/anime\/(\d+)$/,
    kitsu: /kitsu.io\/anime\/(.+)$/,
  }

  private static formatEntry = (entry: OfflineDatabaseEntry): Relation | null => {
    const relation: Relation = {
      anilist: null,
      anidb: null,
      kitsu: null,
      myanimelist: null,
    }

    entry.sources.forEach((src) => {
      const anilistMatch = ArmData.regexes.anilist.exec(src)
      if (anilistMatch) {
        const id = Number(anilistMatch[1])

        if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

        relation.anilist = id
      }

      const anidbMatch = ArmData.regexes.anidb.exec(src)
      if (anidbMatch) {
        const id = Number(anidbMatch[1])

        if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

        relation.anidb = id
      }

      const malMatch = ArmData.regexes.mal.exec(src)
      if (malMatch) {
        const id = Number(malMatch[1])

        if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

        relation.myanimelist = id
      }

      const kitsuMatch = ArmData.regexes.kitsu.exec(src)
      if (kitsuMatch) {
        const id = Number(kitsuMatch[1])

        if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

        relation.kitsu = id
      }
    })

    if (Object.values(relation).every((v) => !v)) {
      return null
    }

    return relation
  }

  private static pushToSupabase = async (relations: Relation[]) => {
    const chunks = chunk(relations, 5_000)
    Logger.debug(`Pushing ${relations.length} relations, split into ${chunks.length} chunks...`)

    const promises = chunks.map((chunkedRelations) =>
      Knex.from("relations")
        .insert(chunkedRelations)
        .catch((err) => err),
    )

    const results = await Promise.allSettled(promises)
    const rejections = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    )

    if (rejections.length > 0) {
      Logger.error(rejections.map((rejection) => rejection.reason))
    }
  }

  private static fetchDatabase = async (): Promise<OfflineDatabaseEntry[] | null> => {
    const response = await fetch(
      "https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json",
    ).catch((err: Error) => err)

    if (response instanceof Error || response.status >= 400) {
      const error = new Error(
        `Failed to fetch updated database!\n${
          response instanceof Error ? response.message : response.status
        }`,
      )

      Logger.error(error)
      captureException(error)

      return null
    }

    return ((await response.json()) as OfflineDatabaseData).data
  }

  public static updateDatabase = async () => {
    Logger.info("Fetching updated Database...")
    const data = await ArmData.fetchDatabase()
    Logger.info("Fetched updated Database.")

    if (data == null) {
      Logger.info("got no data")
      return
    }

    Logger.info("Formatting data...")
    const entries = data.map(ArmData.formatEntry).filter(isDefined)
    Logger.info("Formatted data.")

    Logger.info("Executing manual rules...")
    const fixedEntries = updateBasedOnManualRules(entries)

    Logger.info("Uploading to Supabase...")
    await ArmData.pushToSupabase(fixedEntries)

    Logger.info("Done.")
  }

  public static getRelation = async (input: QueryParamInput) => {
    const result: Relation[] | Error = await Knex.from("relations")
      .select(Object.values(Source))
      .where(input.source, input.id)
      .limit(1)
      .catch((err: Error) => err)

    if (result instanceof Error) {
      Logger.error(result)

      return null
    }

    return result?.[0] ?? null
  }

  public static getRelations = async (input: BodyItem[]) => {
    const result: Relation[] | Error = await Knex("relations")
      .where(function () {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        input.forEach((item) => this.orWhere(item))
      })
      .select(Object.values(Source))
      .catch((err: Error) => err)

    if (result instanceof Error) {
      Logger.error(result)

      return null
    }

    if (result == null) return []

    return input.map((item) => {
      const realItem = Object.entries(item)[0] as [Source, number]

      return result.find((relation) => relation[realItem[0]] === realItem[1]) ?? null
    })
  }
}
