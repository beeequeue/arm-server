export async function up(knex) {
	if (await knex.schema.hasTable("relations")) return

	const promises = []

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

export async function down(knex) {
	await knex.schema.dropTableIfExists("relations")
}
