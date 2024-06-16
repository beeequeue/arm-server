/* c8 ignore start */
import process from "node:process"

import { init } from "@sentry/node"

const { NODE_ENV, SENTRY_DSN, RENDER_GIT_COMMIT } = process.env

init({
  dsn: SENTRY_DSN!,
  enabled: NODE_ENV === "production",
  environment: NODE_ENV!,
  release: RENDER_GIT_COMMIT!,
  ignoreErrors: [/unsupported media type/i],
})
