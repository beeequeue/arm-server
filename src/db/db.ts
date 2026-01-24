import { mkdirSync } from "node:fs"

import { createDatabase } from "db0"
import sqlite from "db0/connectors/node-sqlite"
import { Kysely, Migrator } from "kysely"
import { Db0SqliteDialect } from "kysely-db0/sqlite"

import { ActuallyWorkingMigrationProvider } from "./file-provider.ts"

export const Source = {
	AniDB: "anidb",
	AniList: "anilist",
	AnimePlanet: "anime-planet",
	AniSearch: "anisearch",
	IMDB: "imdb",
	Kitsu: "kitsu",
	LiveChart: "livechart",
	AnimeNewsNetwork: "animenewsnetwork",
	NotifyMoe: "notify-moe",
	TheMovieDB: "themoviedb",
	TheMovieDBSeason: "themoviedb-season",
	TheTVDB: "thetvdb",
	TheTVDBSeason: "thetvdb-season",
	MAL: "myanimelist",
	Simkl: "simkl",
	AnimeCountdown: "animecountdown",
	MediaType: "media",
} as const
export type SourceValue = (typeof Source)[keyof typeof Source]
export const NonUniqueFields = [
	Source.IMDB,
	Source.TheMovieDB,
	Source.TheMovieDBSeason,
	Source.TheTVDB,
	Source.TheTVDBSeason,
	Source.Simkl,
	Source.MediaType,
]

export type Relation = {
	[Source.AniDB]?: number
	[Source.AniList]?: number
	[Source.AnimePlanet]?: string
	[Source.AniSearch]?: number
	[Source.IMDB]?: `tt${string}`
	[Source.Kitsu]?: number
	[Source.LiveChart]?: number
	[Source.AnimeNewsNetwork]?: number
	[Source.NotifyMoe]?: string
	[Source.TheMovieDB]?: number
	[Source.TheTVDB]?: number
	[Source.MAL]?: number
	[Source.TheTVDBSeason]?: number
	[Source.TheMovieDBSeason]?: number
	[Source.Simkl]?: number
	[Source.AnimeCountdown]?: number
	[Source.MediaType]?: string
}

export type OldRelation = Pick<Relation, "anidb" | "anilist" | "myanimelist" | "kitsu">

// Define database schema for Kysely
export interface Database {
	relations: Relation
}

// Ensure SQLite directory exists
mkdirSync("./dir", { recursive: true })

const sqliteDb = sqlite(
	process.env.VITEST_POOL_ID == null
		? { path: `./db/${process.env.NODE_ENV ?? "development"}.sqlite3` }
		: { name: ":memory:" },
)
const db0 = createDatabase(sqliteDb)
// Create Kysely instance
export const db = new Kysely<Database>({
	dialect: new Db0SqliteDialect(db0),
})

export const migrator = new Migrator({
	db,
	provider: new ActuallyWorkingMigrationProvider(
		process.env.NODE_ENV !== "test" ? "dist/migrations" : "src/migrations",
	),
})
