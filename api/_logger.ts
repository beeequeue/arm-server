import Pino from "pino"

export const Logger = Pino({
  level: process.env.VERCEL_ENV === "development" ? "debug" : "info",
  prettyPrint: true,
})
