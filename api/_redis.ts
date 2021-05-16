import { URL } from "url"

import IORedis, { RedisOptions } from "ioredis"

const redisUrl = new URL(process.env.REDIS_URL as string)
const redisConfig: RedisOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  username: redisUrl.username,
  password: redisUrl.password,
  tls: redisUrl.protocol === "rediss:" ? {} : undefined,
}

export const Redis = new IORedis(redisConfig)
