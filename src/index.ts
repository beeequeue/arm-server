import { captureException } from "@sentry/node"

import { config } from "@/config"

import { buildApp } from "./app"
import { updateRelations } from "./update"

const { NODE_ENV, PORT } = config

const runUpdateScript = () => updateRelations().catch(captureException)

const listen = async () => {
  if (NODE_ENV === "production") {
    void runUpdateScript()

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(runUpdateScript, 1000 * 60 * 60 * 24)
  }

  const app = await buildApp()
  await app.listen({
    host: `::`,
    port: PORT,
  })
}

void listen()
