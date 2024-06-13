import Pino from "pino"
import Pretty from "pino-pretty"

import { config } from "@/config"

const isProd = config.NODE_ENV === "production"

const stream = !isProd ? Pretty({ colorize: true }) : undefined

export const logger = Pino(
  {
    level: config.LOG_LEVEL,
    redact: ["headers.authorization", "headers.cookie", "*.token"],
  },
  stream,
)
