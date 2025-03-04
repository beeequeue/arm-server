import { pino } from "pino"

import { config } from "../config.ts"

const stream =
	process.env.NODE_ENV !== "production"
		? (await import("pino-pretty")).PinoPretty()
		: undefined

export const logger = pino(
	{
		level: config.LOG_LEVEL,
		redact: ["headers.authorization", "headers.cookie", "*.token"],
	},
	stream,
)
