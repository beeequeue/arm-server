import { Boom, internal, isBoom } from "@hapi/boom"
import * as Sentry from "@sentry/node"
import type { VercelRequest, VercelResponse } from "@vercel/node"

import { Logger } from "./_logger"

import "@sentry/tracing"

type Handler = (request: VercelRequest, response: VercelResponse) => Promise<void> | void
type CustomResponse = Record<string, unknown> & { message?: string; statusCode?: number }
type CustomHandlerResponse = CustomResponse | Boom<null> | null | undefined
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
    let result: CustomHandlerResponse

    const trx = Sentry.startTransaction({
      name,
      op: "transaction",
    })

    try {
      result = (await handler(req, res)) ?? null
    } catch (error) {
      result = internal(error.message)

      Sentry.setContext("response", {
        status: res.statusCode,
      })

      Logger.error(error)
      Sentry.captureException(error)
    }

    trx.finish()

    await Sentry.flush(1000)

    if (!isBoom(result)) {
      const body = result

      Logger.debug(
        `${req.method as string} ${name} ${res.statusCode}\n${JSON.stringify(body, null, 2)}`,
      )
      res.json(body)
    } else {
      const { payload, statusCode, headers } = result.output
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
