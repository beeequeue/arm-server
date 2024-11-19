import { pino } from "pino"
import PinoPretty from "pino-pretty"

import { config } from "../config.ts"

const isProd = config.NODE_ENV === "production"

const stream = !isProd ? PinoPretty({ colorize: true }) : undefined

export const logger = pino(
	{
		level: config.LOG_LEVEL,
		redact: ["headers.authorization", "headers.cookie", "*.token"],
	},
	stream,
)
