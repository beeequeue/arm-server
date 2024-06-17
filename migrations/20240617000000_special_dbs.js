/** @param knex {import("knex").Knex} */
export async function up(knex) {
  await knex.schema.alterTable("relations", (table) => {
    table.dropUnique("imdb")
    table.dropUnique("themoviedb")
  })
}

/** @param knex {import("knex").Knex} */
export async function down(knex) {
  await knex.schema.alterTable("relations", (table) => {
    table.unique("imdb")
    table.unique("themoviedb")
  })
}
