declare module "*/knexfile" {
	import type { Config } from "knex"

	const config: {
		development: Config
		production: Config
	}

	export = config
}
