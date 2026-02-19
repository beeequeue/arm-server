import type { Kysely } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable("relations").addColumn("themoviedb-season", "integer").execute()
	await db.schema.alterTable("relations").addColumn("thetvdb-season", "integer").execute()
	// unique, but sqlite can't add unique columns to tables
	await db.schema.alterTable("relations").addColumn("animenewsnetwork", "integer").execute()
	// unique, but sqlite can't add unique columns to tables
	await db.schema.alterTable("relations").addColumn("animecountdown", "integer").execute()
	await db.schema.alterTable("relations").addColumn("simkl", "integer").execute()
	await db.schema.alterTable("relations").addColumn("media", "text").execute()
}
