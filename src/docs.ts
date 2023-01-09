import { existsSync } from "fs"
import { readFile } from "fs/promises"
import path from "path"

import { FastifyPluginAsync } from "fastify"

import { logger } from "@/lib/logger"
import { cacheReply, CacheTimes } from "@/utils"

// eslint-disable-next-line unicorn/prefer-module
const filePath = path.resolve(__dirname, "../redoc-static.html")

export const docsPlugin: FastifyPluginAsync = async (fastify) => {
  const docsHtml = existsSync(filePath) ? await readFile(filePath, "utf8") : null

  if (docsHtml == null) {
    logger.warn("Could not find a build docs HTML file.")
  } else {
    fastify.get("/docs", async (_, reply) => {
      cacheReply(reply, CacheTimes.DAY)
      void reply.header("Content-Type", "text/html")

      return docsHtml
    })
  }
}
