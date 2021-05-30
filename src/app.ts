import Fastify from "fastify"
import Helmet from "fastify-helmet"

import RequestLogger from "@mgcrea/fastify-request-logger"
import prettifier from "@mgcrea/pino-pretty-compact"

import { config } from "@/config"
import { sendErrorToSentry } from "@/lib/sentry"

import pkgJson from "../package.json"

export const buildApp = async () => {
  const App = Fastify({
    disableRequestLogging: true,
    logger: {
      level: config.LOG_LEVEL,
      prettifier,
    },
  })

  await App.register(RequestLogger)
  await App.register(Helmet, {
    hsts: config.NODE_ENV === "production",
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })

  App.addHook("onError", (request, _reply, error) => {
    sendErrorToSentry(error, request as any)
  })

  App.get("/", async (_request, reply) => reply.redirect(301, pkgJson.homepage))

  return App
}
