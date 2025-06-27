/**
 *
 * @param knex {import("knex").Knex}
 * @return {Promise<void>}
 */
export async function up(knex) {
	await knex.raw("PRAGMA journal_mode=WAL;")
}

export async function down() {}
