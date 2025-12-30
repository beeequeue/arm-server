import * as v from "valibot"

import type { SourceValue } from "../../../../db/db.ts"
import { numberIdSchema, oldSourceSchema } from "../../../../shared-schemas.ts"

export const singularItemInputSchema = v.pipe(
	v.record(oldSourceSchema, numberIdSchema),
	v.check((data) => Object.keys(data).length > 0, "At least one source is required."),
)

const arrayInputSchema = v.pipe(
	v.array(singularItemInputSchema),
	v.check((data) => data.length > 0, "At least one source is required."),
)

export const bodyInputSchema = v.union([singularItemInputSchema, arrayInputSchema])

type BodyItem = {
	[key in SourceValue]?: number
}

export type BodyQuery = BodyItem | BodyItem[]
