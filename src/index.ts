import { captureException } from "@sentry/node"

import { buildApp } from "./app"
import { updateRelations } from "./update"
import { config } from "@/config"

const { NODE_ENV, PORT } = config

const runUpdateScript = () => updateRelations().catch(captureException)

const listen = async () => {
  if (NODE_ENV === "production") {
    void runUpdateScript()

    // eslint-disable-next-line ts/no-misused-promises
    setInterval(runUpdateScript, 1000 * 60 * 60 * 24)
  }

  const app = await buildApp()
  await app.listen({
    host: "0.0.0.0",
    port: PORT,
  })
}

void listen().catch(console.error)
