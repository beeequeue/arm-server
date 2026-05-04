import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`PRAGMA journal_mode=WAL`.execute(db)

	await db.schema
		.createTable("relations")
		.ifNotExists()

		// Original columns
		.addColumn("anilist", "integer", (col) => col.unique())
		.addColumn("anidb", "integer", (col) => col.unique())
		.addColumn("myanimelist", "integer", (col) => col.unique())
		.addColumn("kitsu", "integer", (col) => col.unique())

		// v2 columns
		.addColumn("anime-planet", "text", (col) => col.unique())
		.addColumn("anisearch", "integer", (col) => col.unique())
		.addColumn("imdb", "text")
		.addColumn("livechart", "integer", (col) => col.unique())
		.addColumn("notify-moe", "text", (col) => col.unique())
		.addColumn("themoviedb", "integer")
		.addColumn("thetvdb", "integer")

		.execute()
}
