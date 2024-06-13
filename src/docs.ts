import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"

import type { FastifyPluginAsync } from "fastify"

import { logger } from "@/lib/logger"
import { CacheTimes, cacheReply } from "@/utils"

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
