import domain from 'domain'
import { Context, Next } from 'koa'
import Sentry from '@sentry/node'
import {
  extractTraceparentData,
  stripUrlQueryAndFragment,
} from '@sentry/tracing'

export const requestHandler = (ctx: Context, next: Next) =>
  new Promise<void>((resolve) => {
    const local = domain.create()

    local.add(ctx as any) // TODO

    local.on('error', (err) => {
      ctx.status = err.status || 500
      ctx.body = err.message
      ctx.app.emit('error', err, ctx)
    })

    local.run(async () => {
      Sentry.getCurrentHub().configureScope((scope) =>
        scope.addEventProcessor((event) =>
          Sentry.Handlers.parseRequest(event, ctx.request as any, {
            user: false,
          }),
        ),
      )

      await next()

      resolve()
    })
  })

export const tracingMiddleWare = async (ctx: Context, next: Next) => {
  const reqMethod = (ctx.method || '').toUpperCase()
  const reqUrl = ctx.url && stripUrlQueryAndFragment(ctx.url)

  // connect to trace of upstream app
  let traceparentData = null

  if (ctx.request.get('sentry-trace')) {
    traceparentData = extractTraceparentData(ctx.request.get('sentry-trace'))
  }

  const transaction = Sentry.startTransaction({
    name: `${reqMethod} ${reqUrl}`,
    op: 'http.server',
    ...traceparentData,
  })

  ctx.__sentry_transaction = transaction

  await next()

  // if using koa router, a nicer way to capture transaction using the matched route
  if (ctx._matchedRoute) {
    const mountPath = ctx.mountPath || ''
    transaction.setName(`${reqMethod} ${mountPath}${ctx._matchedRoute}`)
  }

  transaction.setHttpStatus(ctx.status)
  transaction.finish()
}

export const sendErrorToSentry = (err: Error, ctx: Context) => {
  Sentry.withScope((scope) => {
    scope.addEventProcessor((event) =>
      Sentry.Handlers.parseRequest(event, ctx.request as any),
    )

    Sentry.captureException(err)
  })
}
