import type { JsonValue } from "type-fest"

import { Boom, internal, isBoom } from "@hapi/boom"
import * as Sentry from "@sentry/node"
import type { VercelRequest, VercelResponse } from "@vercel/node"

import { Logger } from "./_logger"

import "@sentry/tracing"

type Handler = (request: VercelRequest, response: VercelResponse) => Promise<void> | void
type CustomHandlerResponse<Body extends JsonValue = JsonValue> = Body | Boom<null> | undefined
export type CustomHandler<Body extends JsonValue = JsonValue> = (
  request: VercelRequest,
  response: Pick<VercelResponse, "setHeader">,
) => Promise<CustomHandlerResponse<Body>> | CustomHandlerResponse<Body>

Sentry.init({
  enabled: process.env.VERCEL_ENV !== "development" && !!process.env.SENTRY_DSN,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV as string,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
  tracesSampleRate: 0.5,
})

Sentry.setTag("app", "api")

export const createHandler =
  (name: string, handler: CustomHandler): Handler =>
  async (req, res) => {
    let result: CustomHandlerResponse

    const trx = Sentry.startTransaction({
      name,
      op: "transaction",
    })

    try {
      result = (await handler(req, res)) ?? null
    } catch (error) /* istanbul ignore next */ {
      result = internal(error.message)

      Sentry.setContext("response", {
        status: res.statusCode,
      })

      Logger.error(error)
      Sentry.captureException(error)
    }

    trx.finish()

    await Sentry.flush(1000)

    res.setHeader("Content-Type", "application/json")

    if (isBoom(result)) {
      const { payload, statusCode, headers } = result.output
      const body = { ...payload, ok: false }

      /* istanbul ignore next */
      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value!)
      }

      res.status(statusCode).json(body)
      Logger.debug(
        `${req.method as string} ${name} ${res.statusCode}\n${JSON.stringify(body, null, 2)}`,
      )

      return
    }

    const body = result ?? "null"

    res.json(body)
    Logger.debug(
      `${req.method as string} ${name} ${res.statusCode}\n${JSON.stringify(body, null, 2)}`,
    )
  }
