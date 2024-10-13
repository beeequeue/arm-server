import process from "node:process"

import { sentry } from "@hono/sentry"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { secureHeaders } from "hono/secure-headers"

import pkgJson from "../package.json" assert { type: "json" }

import { docsRoutes } from "./docs.js"
import { logger } from "./lib/logger.js"
import { v1Routes } from "./routes/v1/ids/handler.js"
import { v2Routes } from "./routes/v2/ids/handler.js"
import { specialRoutes } from "./routes/v2/special/handler.js"
import { cacheReply, CacheTimes, createErrorJson } from "./utils.js"

export const createApp = () => {
	const app = new Hono()
		.use("*", async (c, next) => {
			const start = Date.now()
			logger.info(
				{
					method: c.req.method,
					path: c.req.path,
					headers: c.req.header(),
				},
				"req",
			)

			await next()

			logger.info(
				{
					status: c.res.status,
					ms: Date.now() - start,
				},
				"res",
			)
		})
		.use("*", sentry({ dsn: process.env.SENTRY_DSN! }))
		.use("*", cors({ origin: (origin) => origin }))
		.use("*", secureHeaders())
		.notFound((c) => createErrorJson(c, new HTTPException(404)))
		.onError((error, c) => {
			/* c8 ignore next 4 */
			if (error instanceof HTTPException) {
				const res = error.getResponse()

				if (c.req.method === "GET") {
					cacheReply(res, CacheTimes.WEEK)
				}

				return createErrorJson(c, error)
			}

			logger.error(error, "unhandled error")

			const badImpl = new HTTPException(500, { cause: error })
			return createErrorJson(c, badImpl)
		})
		.route("/api", v1Routes)
		.route("/api/v2", v2Routes)
		.route("/api/v2", specialRoutes)
		.route("/docs", docsRoutes)
		.get("/", (c) => {
			cacheReply(c.res, CacheTimes.WEEK * 4)

			return c.redirect(pkgJson.homepage, 301)
		})

	return app
}
