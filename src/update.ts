import { $fetch, FetchError } from "ohmyfetch"

import { captureException } from "@sentry/node"

import { logger } from "@/lib/logger"

import { knex, Relation } from "./db"
import { updateBasedOnManualRules } from "./manual-rules"

const isFetchError = <T>(response: T | FetchError): response is FetchError =>
  (response as FetchError).stack != null

type AnimeListsSchema = Array<{
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

    // eslint-disable-next-line no-console
    console.error(error)
    captureException(error)

    return null
  }

  return response
}

const formatEntry = (entry: AnimeListsSchema[number]): Relation => ({
  anidb: entry["anidb_id"],
  anilist: entry["anilist_id"],
  "anime-planet": entry["anime-planet_id"],
  anisearch: entry["anisearch_id"],
  imdb: entry["imdb_id"],
  kitsu: entry["kitsu_id"],
  livechart: entry["livechart_id"],
  myanimelist: entry["mal_id"],
  "notify-moe": entry["notify.moe_id"],
  themoviedb:
    typeof entry["themoviedb_id"] !== "string" ? entry["themoviedb_id"] : undefined,
  thetvdb: entry["thetvdb_id"],
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
  logger.info({ amount: formattedEntries.length }, `Formatted entries.`)

  logger.info("Updating database...")
  await knex.transaction((trx) =>
    knex
      .delete()
      .from("relations")
      .transacting(trx)
      .then(async () => {
        await knex.batchInsert("relations", formattedEntries, 100).transacting(trx)
      }),
  )
  logger.info("Updated database.")

  logger.info("Executing manual rules...")
  await updateBasedOnManualRules()

  logger.info("Done.")

  if (process.argv.includes("--exit")) {
    await knex.destroy()
  }
}
