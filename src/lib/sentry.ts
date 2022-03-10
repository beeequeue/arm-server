/* c8 ignore start */
import { FastifyRequest } from "fastify"

import * as Sentry from "@sentry/node"

const { NODE_ENV, SENTRY_DSN } = process.env

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: NODE_ENV === "production",
})

export const sendErrorToSentry = (
  err: Error,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  request: FastifyRequest<{ Querystring: Record<string, unknown> }>,
) => {
  Sentry.withScope((scope) => {
    scope.addEventProcessor((event) => Sentry.Handlers.parseRequest(event, request))

    Sentry.captureException(err)
  })
}
