import { mkdirSync } from "node:fs"

mkdirSync("./sqlite", { recursive: true })

/** @type5 {import("knex").Knex.Config} */
export default {
	client: "better-sqlite3",
	migrations: {
		tableName: "migrations",
		directory: "migrations",
	},
	useNullAsDefault: true,
	connection: {
		filename: `./sqlite/${process.env.NODE_ENV ?? "development"}.sqlite3`,
		options: {
			nativeBinding:
				process.env.NODE_ENV === "production" ? "./dist/better_sqlite3.node" : undefined,
		},
	},
}
