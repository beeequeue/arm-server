import { Boom, internal, isBoom } from "@hapi/boom"
import * as Sentry from "@sentry/node"
import type { VercelRequest, VercelResponse } from "@vercel/node"

import { Logger } from "./_logger"

import "@sentry/tracing"

type Handler = (request: VercelRequest, response: VercelResponse) => Promise<void> | void
type CustomResponse = Record<string, unknown> & { message?: string; statusCode?: number }
type CustomHandlerResponse = undefined | CustomResponse | Boom<null>
export type CustomHandler = (
  request: VercelRequest,
  response: Pick<VercelResponse, "setHeader">,
) => Promise<CustomHandlerResponse> | CustomHandlerResponse

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
    let response: NonNullable<CustomHandlerResponse>

    const trx = Sentry.startTransaction({
      name,
      op: "transaction",
    })

    try {
      response = (await handler(req, res)) ?? {}
    } catch (error) {
      response = internal(error.message)

      Sentry.setContext("response", {
        status: res.statusCode,
      })

      Logger.error(error)
      Sentry.captureException(error)
    }

    trx.finish()

    await Sentry.flush(1000)

    if (!isBoom(response)) {
      response.statusCode ??= 200
      const body = {
        ...response,
        ok: true,
      }

      Logger.debug(
        `${req.method as string} ${name} ${res.statusCode}\n${JSON.stringify(body, null, 2)}`,
      )
      res.status(response.statusCode).json(body)
    } else {
      const { payload, statusCode, headers } = response.output
      const body = { ...payload, ok: false }

      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value!)
      }

      Logger.debug(
        `${req.method as string} ${name} ${res.statusCode}\n${JSON.stringify(body, null, 2)}`,
      )
      res.status(statusCode).json(body)
    }
  }

export const startTask = (name: string) => {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()

  if (transaction == null) throw new Error("thefuck")

  return transaction.startChild({
    op: "task",
    description: name,
  })
}
