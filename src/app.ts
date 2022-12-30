import Fastify from "fastify"
import { customAlphabet, urlAlphabet } from "nanoid"

import Cors from "@fastify/cors"
import Helmet from "@fastify/helmet"

import { config } from "@/config"
import { logger } from "@/lib/logger"
import { sendErrorToSentry } from "@/lib/sentry"
import { apiPlugin } from "@/routes/v1/ids/handler"
import { v2Plugin } from "@/routes/v2/ids/handler"

import pkgJson from "../package.json"

const isProd = config.NODE_ENV === "production"

const nanoid = customAlphabet(urlAlphabet, 16)

export const buildApp = async () => {
  const App = Fastify({
    ignoreTrailingSlash: true,
    onProtoPoisoning: "remove",
    onConstructorPoisoning: "remove",
    trustProxy: isProd,
    genReqId: () => nanoid(),
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
    /* c8 ignore next 4 */
    if (error.validation == null) {
      sendErrorToSentry(error, request)
    }

    next()
  })

  await App.register(apiPlugin, { prefix: "/api" })
  await App.register(v2Plugin, { prefix: "/api/v2" })

  App.get("/", async (_request, reply) => reply.redirect(301, pkgJson.homepage))

  return App
}
