import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { secureHeaders } from "hono/secure-headers"

import pkgJson from "../package.json" assert { type: "json" }
import { docsRoutes } from "@/docs"
import { logger } from "@/lib/logger"
import { sendErrorToSentry } from "@/lib/sentry"
import { v1Routes } from "@/routes/v1/ids/handler"
import { CacheTimes, cacheReply } from "@/utils"

export const buildApp = async () => {
  const app = new Hono()
    .use("*", async (c, next) => {
      const start = Date.now()
      logger.info({
        method: c.req.method,
        path: c.req.path,
        headers: c.req.header(),
      }, "req")

      await next()

      logger.info({
        status: c.res.status,
        ms: Date.now() - start,
      }, "res")
    })
    .use("*", cors({ origin: (origin) => origin }))
    .use("*", secureHeaders())
    .onError((error, c) => {
      /* c8 ignore next 4 */
      if (error instanceof HTTPException) {
        const res = error.getResponse()

        if (c.req.method === "GET") {
          cacheReply(res, CacheTimes.WEEK)
        }

        return res
      }

      sendErrorToSentry(error, c.req)

      return new HTTPException(500, { message: "Internal Server Error" }).getResponse()
    })
    .route("/api", v1Routes)
    // .route("/api/v2", v2Plugin)
    // .route("/api/v2", thetvdbPlugin)
    .route("/docs", docsRoutes)
    .get("/", (c) => {
      cacheReply(c.res, CacheTimes.WEEK * 4)

      return c.redirect(pkgJson.homepage, 301)
    })

  return app
}
