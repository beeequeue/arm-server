import { log } from "evlog"
import xior, { type XiorError } from "xior"
import errorRetryPlugin from "xior/plugins/error-retry"

import { config, Environment } from "./config.ts"
import { db, migrator, NonUniqueFields, type Relation, Source, type SourceValue } from "./db/db.ts"
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
	"notify.moe_id"?: string
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
			"https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json",
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
	if (typeof value === "string" && (badValues.includes(value as never) || value.includes(","))) {
		return undefined
	}

	return value as T
}

// Removes duplicate source-id pairs from the list, except for thetvdb and themoviedb ids
export const removeDuplicates = (entries: Relation[]): Relation[] => {
	const sources = (Object.values(Source) as SourceValue[]).filter((source) =>
		NonUniqueFields.every((field) => field !== source),
	)
	const existing = new Map<SourceValue, Set<unknown>>(sources.map((name) => [name, new Set()]))

	const goodEntries = entries.filter((entry) => {
		for (const source of Object.keys(entry) as (keyof typeof entry)[]) {
			const id = entry[source]

			// Ignore nulls
			if (id == null) continue
			// Ignore sources with one-to-many relations
			// eslint-disable-next-line unicorn/prefer-includes
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
	"notify-moe": handleBadValues(entry["notify.moe_id"]),
	themoviedb: handleBadValues(entry.themoviedb_id),
	"themoviedb-season": handleBadValues(entry.season?.tmdb),
	thetvdb: handleBadValues(entry.tvdb_id),
	"thetvdb-season": handleBadValues(entry.season?.tvdb),
	simkl: handleBadValues(entry.simkl_id),
	media: handleBadValues(entry.type),
})

export const updateRelations = async () => {
	log.debug("update", `Using ${process.env.NODE_ENV!} database configuration...`)

	log.info("update", "Fetching updated Database...")
	const data = await fetchDatabase()
	log.info("update", "Fetched updated Database.")

	if (data == null) {
		log.error("update", "got no data")
		return
	}

	log.info("update", "Formatting entries...")
	const formattedEntries = data
		.map(formatEntry)
		.filter((entry) => Object.values(entry).some((value) => value != null))
	log.info("update", `Formatted entries. ${formattedEntries.length} remain.`)

	log.info("update", `Removing duplicates.`)
	const goodEntries = removeDuplicates(formattedEntries)
	log.info("update", `Removed duplicates. ${goodEntries.length} remain.`)

	if (config.NODE_ENV !== Environment.Prod) {
		const { error, results } = await migrator.migrateToLatest()

		results?.forEach((it) => {
			log.info("update", `Migration ${it.direction} "${it.migrationName}" ...`)
			if (it.status === "Success") {
				log.info("update", `... was executed successfully`)
			} else if (it.status === "Error") {
				log.error("update", `... FAILED!`)
			}
		})
		if (Boolean(error) || "Error" in (results?.map((x) => x.status) || [])) {
			throw new Error(`failed to run 'migrateToLatest' ${(error as string) || ""}`)
		}
	}

	log.info("update", "Updating database...")
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
	log.info("update", "Updated database.")

	log.info("update", "Executing manual rules...")
	await updateBasedOnManualRules()

	log.info("update", "Done.")

	if (process.argv.includes("--exit")) {
		await db.destroy()
	}
}
