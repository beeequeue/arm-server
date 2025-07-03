import { serve } from "@hono/node-server"

import { createApp } from "./app.ts"
import { config } from "./config.ts"
import { migrator } from "./db.ts"
import { updateRelations } from "./update.ts"

const { NODE_ENV, PORT } = config

// Note: Migrations are handled separately and not through Kysely

const runUpdateScript = async () => updateRelations()

if (NODE_ENV === "production") {
	void runUpdateScript()

	// eslint-disable-next-line ts/no-misused-promises
	setInterval(runUpdateScript, 1000 * 60 * 60 * 24)
}

const app = createApp()

await migrator.migrateToLatest()

serve({ fetch: app.fetch, hostname: "0.0.0.0", port: PORT }, () => {
	console.log(`Server running on ${PORT}`)
})
