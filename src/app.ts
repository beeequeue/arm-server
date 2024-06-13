import process from "node:process"

import Fastify from "fastify"
import { customAlphabet, urlAlphabet } from "nanoid"

import Cors from "@fastify/cors"
import Helmet from "@fastify/helmet"

import pkgJson from "../package.json"
import { config } from "@/config"
import { docsPlugin } from "@/docs"
import { logger } from "@/lib/logger"
import { sendErrorToSentry } from "@/lib/sentry"
import { apiPlugin } from "@/routes/v1/ids/handler"
import { v2Plugin } from "@/routes/v2/ids/handler"
import { thetvdbPlugin } from "@/routes/v2/thetvdb/handler"
import { CacheTimes, cacheReply } from "@/utils"

const PROD = config.NODE_ENV === "production"

const nanoid = customAlphabet(urlAlphabet, 16)

export const buildApp = async () => {
  const App = Fastify({
    ignoreTrailingSlash: true,
    onProtoPoisoning: "remove",
    onConstructorPoisoning: "remove",
    trustProxy: PROD,
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

  App.addHook("onError", (request, reply, error, next) => {
    /* c8 ignore next 4 */
    if (error.validation != null) {
      if (request.method === "GET") {
        cacheReply(reply, CacheTimes.WEEK)
      }
    } else {
      sendErrorToSentry(error, request)
    }

    next()
  })

  await App.register(apiPlugin, { prefix: "/api" })
  await App.register(v2Plugin, { prefix: "/api/v2" })
  await App.register(thetvdbPlugin, { prefix: "/api/v2" })
  await App.register(docsPlugin)

  App.get("/", async (_, reply) => {
    cacheReply(reply, CacheTimes.WEEK * 2)
    void reply.redirect(301, pkgJson.homepage)
  })

  return App
}
