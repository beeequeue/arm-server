import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"

import { Hono } from "hono"

import { cacheReply, CacheTimes } from "./utils.ts"

const filePath = path.resolve(import.meta.dirname, "../redoc-static.html")
let docsHtml: string | null = null

export const docsRoutes = new Hono()

docsRoutes.get("/", async (c) => {
	if (docsHtml != null) {
		cacheReply(c.res, CacheTimes.DAY)

		return c.html(docsHtml)
	}

	docsHtml = existsSync(filePath) ? await readFile(filePath, "utf8") : null

	if (docsHtml == null) {
		throw new Error("docs.html not found")
	} else {
		cacheReply(c.res, CacheTimes.DAY)

		return c.html(docsHtml)
	}
})
