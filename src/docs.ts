import { existsSync } from "fs"
import { readFile } from "fs/promises"
import path from "path"

import { FastifyPluginAsync } from "fastify"

import { logger } from "@/lib/logger"

// eslint-disable-next-line unicorn/prefer-module
const filePath = path.resolve(__dirname, "../redoc-static.html")

export const docsPlugin: FastifyPluginAsync = async (fastify) => {
  const docsHtml = existsSync(filePath) ? await readFile(filePath, "utf8") : null

  if (docsHtml == null) {
    logger.warn("Could not find a build docs HTML file.")
  } else {
    fastify.get("/docs", async (_, reply) => {
      void reply.header("Cache-Control", "public,max-age=86400")
      void reply.header("Content-Type", "text/html")

      return docsHtml
    })
  }
}
