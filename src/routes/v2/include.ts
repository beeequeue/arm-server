import * as v from "valibot"

import { Source } from "../../db.ts"

export const includeSchema = v.object({
	include: v.optional(
		v.pipe(
			v.string(),
			v.regex(/^[\-a-z,]+$/, "Invalid `include` query"),
			v.minLength(1),
			v.maxLength(100),
		),
	),
})

export type IncludeQuery = v.InferOutput<typeof includeSchema>

const sources = Object.values(Source)
export const buildSelectFromInclude = (include: string | null | undefined) => {
	if (include == null) {
		return "*"
	}

	return include.split(",").filter((inclusion) => sources.includes(inclusion as Source))
}
