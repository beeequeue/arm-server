import { $fetch, FetchError } from "ohmyfetch"

import { captureException } from "@sentry/node"

import { logger } from "@/lib/logger"

import { knex, Relation } from "./db"
import { updateBasedOnManualRules } from "./manual-rules"

const isFetchError = <T>(response: T | FetchError): response is FetchError =>
  (response as FetchError).stack != null

type OfflineDatabaseSchema = {
  sources: string[]
  type: string
  title: string
  picture: string
  relations: string[]
  thumbnail: string
  episodes: number
  synonyms: string[]
}

const fetchDatabase = async (): Promise<OfflineDatabaseSchema[] | null> => {
  const response = await $fetch<{ data: OfflineDatabaseSchema[] }>(
    "https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json",
    {
      responseType: "json",
      retry: 5,
    },
  ).catch((error: FetchError) => error)

  if (isFetchError(response)) {
    const error = new Error("Could not fetch updated database!!", { cause: response })

    // eslint-disable-next-line no-console
    console.error(error)
    captureException(error)

    return null
  }

  return response.data
}

const regexes = {
  anilist: /anilist.co\/anime\/(\d+)$/,
  anidb: /anidb.net\/a(?:nime\/)?(\d+)$/,
  mal: /myanimelist.net\/anime\/(\d+)$/,
  kitsu: /kitsu.io\/anime\/(.+)$/,
}

const formatEntry = (entry: OfflineDatabaseSchema): Relation => {
  const relation: Relation = {}

  for (const src of entry.sources) {
    const anilistMatch = regexes.anilist.exec(src)
    if (anilistMatch) {
      const id = Number(anilistMatch[1])

      if (Number.isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.anilist = id
    }

    const anidbMatch = regexes.anidb.exec(src)
    if (anidbMatch) {
      const id = Number(anidbMatch[1])

      if (Number.isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.anidb = id
    }

    const malMatch = regexes.mal.exec(src)
    if (malMatch) {
      const id = Number(malMatch[1])

      if (Number.isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.myanimelist = id
    }

    const kitsuMatch = regexes.kitsu.exec(src)
    if (kitsuMatch) {
      const id = Number(kitsuMatch[1])

      if (Number.isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.kitsu = id
    }
  }

  return relation
}

export const updateRelations = async () => {
  logger.debug(`Using ${process.env.NODE_ENV!} database configuration...`)

  logger.info("Fetching updated Database...")
  const data = await fetchDatabase()
  logger.info("Fetched updated Database.")

  if (data == null) {
    logger.error("got no data")
    return
  }

  logger.info("Formatting entries...")
  const formattedEntries = data
    .map(formatEntry)
    .filter((entry) => Object.keys(entry).length > 1)
  logger.info({ amount: formattedEntries.length }, `Formatted entries.`)

  logger.info("Updating database...")
  await knex.transaction((trx) =>
    knex
      .delete()
      .from("relations")
      .transacting(trx)
      .then(() => knex.batchInsert("relations", formattedEntries, 100).transacting(trx)),
  )
  logger.info("Updated database.")

  logger.info("Executing manual rules...")
  await updateBasedOnManualRules()

  logger.info("Done.")

  if (process.argv.includes("--exit")) {
    await knex.destroy()
  }
}
