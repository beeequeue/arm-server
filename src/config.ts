import process from "node:process"

import { z }od from "zod"

export enum Environment {
  Development = "development",
  Test = "test",
  Production = "production",
}

const schema = zod.object({
  NODE_ENV: zod.nativeEnum(Environment).default(Environment.Development),
  PORT: zod.preprocess(Number, zod.number().int()).default(3000),
  LOG_LEVEL: zod
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  USER_AGENT: zod.string().default("arm-server"),
})

const result = schema.safeParse(process.env)

if (!result.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(result.error.format(), null, 4),
  )

  process.exit(1)
}

export const config = result.data
