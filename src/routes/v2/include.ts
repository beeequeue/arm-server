import * as v from "valibot"

import { db, Source, type SourceValue } from "../../db/db.ts"

const allSources = Object.values(Source)

export const includeSchema = v.object({
	include: v.optional(
		v.pipe(
			v.string(),
			v.regex(/^[\-a-z,]+$/, "Invalid `include` query"),
			v.transform((value) => value.split(",")),
			v.transform((sources) => (sources.length > 1 ? Array.from(new Set(sources)) : sources)),
			v.minLength(1),
			v.maxLength(allSources.length),
		),
	),
})

export type IncludeQuery = v.InferOutput<typeof includeSchema>

const selectAll = allSources.map((column) => db.dynamic.ref<SourceValue>(column))
export const buildSelectFromInclude = (include: string[] | null | undefined) => {
	if (include == null) {
		return selectAll
	}

	return include
		.filter((inclusion) => allSources.includes(inclusion as SourceValue))
		.map((column) => db.dynamic.ref<SourceValue>(column))
}
