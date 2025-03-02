import { pino } from "pino"

import { config } from "../config.ts"

const isProd = config.NODE_ENV === "production"

const stream = !isProd ? (await import("pino-pretty")).PinoPretty() : undefined

export const logger = pino(
	{
		level: config.LOG_LEVEL,
		redact: ["headers.authorization", "headers.cookie", "*.token"],
	},
	stream,
)
