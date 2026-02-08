import { createRequestLogger, initLogger, type LoggerConfig, type RequestLogger } from "evlog"
import { definePlugin, onError } from "h3"

declare module "h3" {
	export interface H3EventContext {
		logger: RequestLogger
	}
}

export const evlog = definePlugin<LoggerConfig>((app, options) => {
	initLogger(options)

	app.use(async (event, next) => {
		const start = performance.now()

		event.context.logger = createRequestLogger({
			method: event.req.method,
			path: event.url.pathname,
		})
		event.context.logger.set({
			userAgent: event.req.headers.get("user-agent"),
		})

		await next()

		event.context.logger.set({
			status: event.res.status,
			duration: Math.round((performance.now() - start + Number.EPSILON) * 10000) / 10000,
		})

		event.context.logger.emit()
	})

	app.use(
		onError((error, event) => {
			event.context.logger.error(error)
		}),
	)
})
