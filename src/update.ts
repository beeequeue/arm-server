import process from "node:process"

import { captureException } from "@sentry/node"
import type { FetchError } from "ofetch/node"
import { $fetch } from "ofetch/node"

import { type Relation, Source, knex } from "./db.js"
import { updateBasedOnManualRules } from "./manual-rules.js"
import { logger } from "./lib/logger.js"

const isFetchError = <T>(response: T | FetchError): response is FetchError => (response as FetchError).stack != null

export type AnimeListsSchema = Array<{
  anidb_id?: number
  anilist_id?: number
  "anime-planet_id"?: string
  anisearch_id?: number
  imdb_id?: `tt${string}`
  kitsu_id?: number
  livechart_id?: number
  mal_id?: number
  "notify.moe_id"?: string
  themoviedb_id?: number | "unknown"
  thetvdb_id?: number
}>

const fetchDatabase = async (): Promise<AnimeListsSchema | null> => {
  const response = await $fetch<AnimeListsSchema>(
    "https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json",
    {
      responseType: "json",
      retry: 5,
    },
  ).catch((error: FetchError) => error)

  if (isFetchError(response)) {
    const error = new Error("Could not fetch updated database!!", { cause: response })

    console.error(error)
    captureException(error)

    return null
  }

  return response
}

const badValues = ["unknown", "tv special"] as const

const handleBadValues = <T extends string | number | undefined>(
  value: T | "unknown",
): T | undefined => {
  if (typeof value === "string" && (badValues.includes(value as any) || value.includes(","))) {
    return undefined
  }

  return value as T
}

export const removeDuplicates = (entries: Relation[]): Relation[] => {
  const sources = (Object.values(Source) as Source[]).filter(
    (source) => source !== Source.TheTVDB,
  )
  const existing = new Map<Source, Set<unknown>>(sources.map((name) => [name, new Set()]))

  return entries.filter((entry) => {
    for (const source of sources) {
      if (entry[source] == null) continue

      const set = existing.get(source)!
      if (set.has(entry[source])) return false

      set.add(entry[source])
    }

    return true
  })
}

export const formatEntry = (entry: AnimeListsSchema[number]): Relation => ({
  anidb: handleBadValues(entry.anidb_id),
  anilist: handleBadValues(entry.anilist_id),
  "anime-planet": handleBadValues(entry["anime-planet_id"]),
  anisearch: handleBadValues(entry.anisearch_id),
  imdb: handleBadValues(entry.imdb_id),
  kitsu: handleBadValues(entry.kitsu_id),
  livechart: handleBadValues(entry.livechart_id),
  myanimelist: handleBadValues(entry.mal_id),
  "notify-moe": handleBadValues(entry["notify.moe_id"]),
  themoviedb: handleBadValues(entry.themoviedb_id),
  thetvdb: handleBadValues(entry.thetvdb_id),
})

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
    .filter((entry) => Object.values(entry).some((value) => value != null))
  logger.info({ remaining: formattedEntries.length }, `Formatted entries.`)

  logger.info(`Removing duplicates.`)
  const goodEntries = removeDuplicates(formattedEntries)
  logger.info({ remaining: goodEntries.length }, `Removed duplicates.`)

  logger.info("Updating database...")
  await knex.transaction((trx) =>
    knex
      .delete()
      .from("relations")
      .transacting(trx)
      .then(async () => {
        await knex.batchInsert("relations", goodEntries, 100).transacting(trx)
      })
  )
  logger.info("Updated database.")

  logger.info("Executing manual rules...")
  await updateBasedOnManualRules()

  logger.info("Done.")

  if (process.argv.includes("--exit")) {
    await knex.destroy()
  }
}
