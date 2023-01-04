import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("relations", (table) => {
    table.text("anime-planet").unique()
    table.integer("anisearch").unique()
    table.text("imdb").unique()
    table.integer("livechart").unique()
    table.text("notify-moe").unique()
    table.integer("themoviedb").unique()
    table.integer("thetvdb")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("relations", (table) => {
    table.dropColumns(
      "anime-planet",
      "anisearch",
      "imdb",
      "livechart",
      "notify-moe",
      "themoviedb",
      "thetvdb",
    )
  })
}
