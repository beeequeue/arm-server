import { H3, handleCacheHeaders, handleCors, redirect } from "h3"

import { docsRoutes } from "./docs.ts"
import { logger } from "./lib/logger.ts"
import { v1Routes } from "./routes/v1/ids/handler.ts"
import { v2Routes } from "./routes/v2/ids/handler.ts"
import { specialRoutes } from "./routes/v2/special/handler.ts"
import { CacheTimes, createErrorJson } from "./utils.ts"

export const createApp = () =>
	new H3({
		onError: (error, event) => {
			/* c8 ignore next 4 */
			if (!error.unhandled) {
				if (event.req.method === "GET") {
					handleCacheHeaders(event, { maxAge: CacheTimes.WEEK })
				}

				return createErrorJson(event, error)
			}

			logger.error(error, "unhandled error")

			return createErrorJson(event, error)
		},
	})

		.use(async (event, next) => {
			const start = performance.now()
			logger.info(
				{
					method: event.req.method,
					path: event.url.pathname,
					headers: event.req.headers,
				},
				"req",
			)

			await next()

			logger.info(
				{
					status: event.res.status,
					ms: performance.now() - start,
				},
				"res",
			)
		})

		.use(async (event, next) => {
			const response = handleCors(event, {
				origin: () => true,
				methods: "*",
				preflight: { statusCode: 204 },
			})
			if (response !== false) return response

			return next()
		})

		.mount("/api", v1Routes)
		.mount("/api/v2", v2Routes)
		.mount("/api/v2", specialRoutes)
		.mount("/docs", docsRoutes)

		.get("/", (event) => {
			handleCacheHeaders(event, { maxAge: CacheTimes.WEEK * 4 })

			return redirect(event, process.env.HOMEPAGE!, 301)
		})

		// This makes sure we return "null" instead of an empty response when trying to return a null body
		.use(
			async (event, next) => {
				const body = await next()

				if (body === null) {
					event.res.headers.set("Content-Type", "application/json")
					return "null"
				}
			},
			{
				match: (e) =>
					(e.req.method === "GET" || e.req.method === "POST") &&
					e.url.pathname.startsWith("/api"),
			},
		)
