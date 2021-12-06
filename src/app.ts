import Fastify from "fastify"
import Cors from "fastify-cors"
import Helmet from "fastify-helmet"
import { customAlphabet, urlAlphabet } from "nanoid"

import { config } from "@/config"
import { logger } from "@/lib/logger"
import { sendErrorToSentry } from "@/lib/sentry"
import { apiPlugin } from "@/routes/ids"

import pkgJson from "../package.json"

const isProd = config.NODE_ENV === "production"

const nanoid = customAlphabet(urlAlphabet, 16)

export const buildApp = async () => {
  const App = Fastify({
    ignoreTrailingSlash: true,
    onProtoPoisoning: "remove",
    onConstructorPoisoning: "remove",
    trustProxy: isProd,
    genReqId: nanoid,
    disableRequestLogging: process.env.NODE_ENV === "test",
    logger,
  })

  await App.register(Cors, {
    origin: true,
  })

  await App.register(Helmet, {
    hsts: false,
    contentSecurityPolicy: false,
  })

  App.addHook("onError", (request, _reply, error, next) => {
    if (error.validation == null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      sendErrorToSentry(error, request as any)
    }

    next()
  })

  await App.register(apiPlugin, { prefix: "/api" })

  App.get("/", async (_request, reply) => reply.redirect(301, pkgJson.homepage))

  return App
}
