import { mkdirSync } from "node:fs"

import { createDatabase } from "db0"
import sqlite from "db0/connectors/node-sqlite"
import { Kysely } from "kysely"

import { Db0SqliteDialect } from "./db/db0-dialect.ts"

export enum Source {
	AniDB = "anidb",
	AniList = "anilist",
	AnimePlanet = "anime-planet",
	AniSearch = "anisearch",
	IMDB = "imdb",
	Kitsu = "kitsu",
	LiveChart = "livechart",
	NotifyMoe = "notify-moe",
	TheMovieDB = "themoviedb",
	TheTVDB = "thetvdb",
	MAL = "myanimelist",
}

export type Relation = {
	[Source.AniDB]?: number
	[Source.AniList]?: number
	[Source.AnimePlanet]?: string
	[Source.AniSearch]?: number
	[Source.IMDB]?: `tt${string}`
	[Source.Kitsu]?: number
	[Source.LiveChart]?: number
	[Source.NotifyMoe]?: string
	[Source.TheMovieDB]?: number
	[Source.TheTVDB]?: number
	[Source.MAL]?: number
}

export type OldRelation = Pick<
	Relation,
	Source.AniDB | Source.AniList | Source.MAL | Source.Kitsu
>

// Define database schema for Kysely
export interface Database {
	relations: Relation
}

// Ensure SQLite directory exists
mkdirSync("./sqlite", { recursive: true })

const db0 = createDatabase(
	sqlite({ path: `./sqlite/${process.env.NODE_ENV ?? "development"}.sqlite3` }),
)
// Create Kysely instance
export const db = new Kysely<Database>({
	dialect: new Db0SqliteDialect(db0),
})
