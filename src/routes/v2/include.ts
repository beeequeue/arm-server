import { z } from "zod"

import { Source } from "../../db.js"

export const includeSchema = z.object({
	include: z
		.string()
		.regex(/^[\-a-z,]+$/, { message: "Invalid `include` query" })
		.min(1)
		.max(100)
		.optional(),
})

export type IncludeQuery = z.infer<typeof includeSchema>

const sources = Object.values(Source)
export const buildSelectFromInclude = (include: string | null | undefined) => {
	if (include == null) {
		return "*"
	}

	return include.split(",").filter((inclusion) => sources.includes(inclusion as Source))
}
