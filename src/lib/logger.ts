import { FastifyRequest } from "fastify"
import Pino from "pino"
import { createWriteStream } from "pino-logflare"
import Pretty from "pino-pretty"

import { config } from "@/config"

const isProd = config.NODE_ENV === "production"

const stream = isProd
  ? /* c8 ignore next 4 */
    createWriteStream({
      apiKey: config.LOGFLARE_API_KEY,
      sourceToken: "699c85bf-7f95-4836-9383-79b57ef87c23",
    })
  : Pretty({ colorize: true })

export const logger = Pino(
  {
    level: config.LOG_LEVEL,
    redact: ["req.headers.authorization", "req.headers.cookie"],
    serializers: {
      req: ({ method, url, params, routerPath, headers }: FastifyRequest) => ({
        method,
        url,
        params,
        routerPath,
        headers,
      }),
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  stream,
)
