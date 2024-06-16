import { serve } from "@hono/node-server"
import { captureException } from "@sentry/node"

import { createApp } from "./app.js"
import { config } from "./config.js"
import { updateRelations } from "./update.js"

const { NODE_ENV, PORT } = config

const runUpdateScript = () => updateRelations().catch(captureException)

if (NODE_ENV === "production") {
	void runUpdateScript()

	// eslint-disable-next-line ts/no-misused-promises
	setInterval(runUpdateScript, 1000 * 60 * 60 * 24)
}

const app = createApp()

serve({ fetch: app.fetch, hostname: "0.0.0.0", port: PORT })
