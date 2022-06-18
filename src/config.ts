/* eslint-disable @typescript-eslint/naming-convention */
import zod from "zod"

export enum Environment {
  Development = "development",
  Test = "test",
  Production = "production",
}

const schema = zod.object({
  NODE_ENV: zod.nativeEnum(Environment).default(Environment.Development),
  PORT: zod.number().default(3000),
  LOG_LEVEL: zod
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  USER_AGENT: zod.string().default("arm-server"),
})

export const config = schema.parse(process.env)
