/* c8 ignore start */
import { FastifyRequest } from "fastify"

import * as Sentry from "@sentry/node"

const { NODE_ENV, SENTRY_DSN } = process.env

Sentry.init({
  dsn: SENTRY_DSN!,
  enabled: NODE_ENV === "production",
})

export const sendErrorToSentry = (err: Error, request: FastifyRequest) => {
  Sentry.withScope((scope) => {
    scope.addEventProcessor((event) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Sentry.Handlers.parseRequest(event, request as any),
    )

    Sentry.captureException(err)
  })
}
