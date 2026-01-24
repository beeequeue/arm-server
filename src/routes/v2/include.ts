import * as v from "valibot"

import { db, Source, type SourceValue } from "../../db/db.ts"

export const includeSchema = v.object({
	include: v.optional(
		v.pipe(
			v.string(),
			v.regex(/^[\-a-z,]+$/, "Invalid `include` query"),
			v.minLength(1),
			v.maxLength(200),
		),
	),
})

export type IncludeQuery = v.InferOutput<typeof includeSchema>

const sources = Object.values(Source)
const selectAll = sources.map((column) => db.dynamic.ref<SourceValue>(column))
export const buildSelectFromInclude = (include: string | null | undefined) => {
	if (include == null) {
		return selectAll
	}

	return include
		.split(",")
		.filter((inclusion) => sources.includes(inclusion as SourceValue))
		.map((column) => db.dynamic.ref<SourceValue>(column))
}
