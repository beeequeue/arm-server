import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"

import { H3, handleCacheHeaders, html } from "h3"

import { CacheTimes } from "./utils.ts"

const filePath = path.resolve(import.meta.dirname, "../redoc-static.html")
let docsHtml: string | null = null

export const docsRoutes = new H3()

docsRoutes.get("/", async (event) => {
	if (docsHtml != null) {
		handleCacheHeaders(event, { maxAge: CacheTimes.DAY })

		return html(event, docsHtml)
	}

	docsHtml = existsSync(filePath) ? await readFile(filePath, "utf8") : null

	if (docsHtml == null) {
		throw new Error("docs.html not found")
	} else {
		handleCacheHeaders(event, { maxAge: CacheTimes.DAY })

		return html(event, docsHtml)
	}
})
