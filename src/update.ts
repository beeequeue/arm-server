import xior, { type XiorError } from "xior"
import errorRetryPlugin from "xior/plugins/error-retry"

import { config, Environment } from "./config.ts"
import {
	db,
	migrator,
	NonUniqueFields,
	type Relation,
	Source,
	type SourceValue,
} from "./db/db.ts"
import { logger } from "./lib/logger.ts"
import { updateBasedOnManualRules } from "./manual-rules.ts"

const http = xior.create({ responseType: "json" })
http.plugins.use(errorRetryPlugin({ retryTimes: 5 }))

const isXiorError = <T>(response: T | XiorError): response is XiorError =>
	"stack" in (response as XiorError)

export type AnimeListsSchema = Array<{
	type?: string
	anidb_id?: number
	anilist_id?: number
	"anime-planet_id"?: string
	anisearch_id?: number
	imdb_id?: `tt${string}` | ""
	kitsu_id?: number
	livechart_id?: number
	mal_id?: number
	animenewsnetwork_id?: number
	animecountdown_id?: number
	simkl_id?: number
	themoviedb_id?: number | "unknown"
	tvdb_id?: number
	season?: {
		tvdb?: number
		tmdb?: number
	}
}>

const fetchDatabase = async (): Promise<AnimeListsSchema | null> => {
	const response = await http
		.get<AnimeListsSchema>(
			"https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-mini.json",
		)
		.catch((error: XiorError) => error)

	if (isXiorError(response)) {
		const error = new Error("Could not fetch updated database!!", {
			cause: response,
		})

		console.error(error)

		return null
	}

	return response.data
}

const badValues = ["", "unknown", "tv special"] as const

const handleBadValues = <T extends string | number | undefined>(
	value: T | (typeof badValues)[number],
): T | undefined => {
	if (
		typeof value === "string" &&
		(badValues.includes(value as never) || value.includes(","))
	) {
		return undefined
	}

	return value as T
}

// Removes duplicate source-id pairs from the list, except for thetvdb and themoviedb ids
export const removeDuplicates = (entries: Relation[]): Relation[] => {
	const sources = (Object.values(Source) as SourceValue[]).filter((source) =>
		NonUniqueFields.every((field) => field !== source),
	)
	const existing = new Map<SourceValue, Set<unknown>>(
		sources.map((name) => [name, new Set()]),
	)

	const goodEntries = entries.filter((entry) => {
		for (const source of Object.keys(entry) as (keyof typeof entry)[]) {
			const id = entry[source]

			// Ignore nulls
			if (id == null) continue
			// Ignore sources with one-to-many relations
			if (NonUniqueFields.some((field) => field === source)) continue

			if (existing.get(source)!.has(id)) return false

			existing.get(source)!.add(id)
		}

		return true
	})

	return goodEntries
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
	animenewsnetwork: handleBadValues(entry.animenewsnetwork_id),
	animecountdown: handleBadValues(entry.animecountdown_id),
	themoviedb: handleBadValues(entry.themoviedb_id),
	"themoviedb-season": handleBadValues(entry.season?.tmdb),
	thetvdb: handleBadValues(entry.tvdb_id),
	"thetvdb-season": handleBadValues(entry.season?.tvdb),
	simkl: handleBadValues(entry.simkl_id),
	media: handleBadValues(entry.type),
})

export const updateRelations = async () => {
	logger.debug(`Using ${process.env.NODE_ENV!} database configuration...`)

	logger.info("Fetching updated Database...")
	const data = await fetchDatabase()
	logger.info({ total: Number(data?.length) }, "Fetched updated Database.")

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

	if (config.NODE_ENV !== Environment.Prod) {
		const { error, results } = await migrator.migrateToLatest()

		results?.forEach((it) => {
			logger.info(`Migration ${it.direction} "${it.migrationName}" ...`)
			if (it.status === "Success") {
				logger.info(`... was executed successfully`)
			} else if (it.status === "Error") {
				logger.error(`... FAILED!`)
			}
		})
		if (error || "Error" in (results?.map((x) => x.status) || [])) {
			throw new Error(`failed to run 'migrateToLatest' ${error || ""}`)
		}
	}

	logger.info("Updating database...")
	await db.transaction().execute(async (trx) => {
		// Delete all existing relations
		await trx.deleteFrom("relations").execute()

		// Insert new relations in chunks of 100
		const chunkSize = 100
		for (let i = 0; i < goodEntries.length; i += chunkSize) {
			const chunk = goodEntries.slice(i, i + chunkSize)
			for (const entry of chunk) {
				await trx.insertInto("relations").values(entry).execute()
			}
		}
	})
	logger.info("Updated database.")

	logger.info("Executing manual rules...")
	await updateBasedOnManualRules()

	logger.info("Done.")

	if (process.argv.includes("--exit")) {
		await db.destroy()
	}
}
