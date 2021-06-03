import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable("relations")) return

  const promises: Promise<void>[] = []

  promises.push(
    knex.schema.createTable("relations", (table) => {
      table.integer("anilist").unique()
      table.integer("anidb").unique()
      table.integer("myanimelist").unique()
      table.integer("kitsu").unique()
    }),
  )

  await Promise.all(promises)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("relations")
}
