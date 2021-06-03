import Pino from "pino"

import { config } from "../config"

export const Logger = Pino({
  level: config.LOG_LEVEL,
  prettyPrint: config.NODE_ENV !== "production",
})
