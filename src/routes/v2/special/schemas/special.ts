import * as v from "valibot"

import { imdbIdSchema, numberIdSchema } from "../../../../shared-schemas.ts"
import { includeSchema } from "../../include.ts"

export const specialInputSchema = v.intersect([
	v.object({ id: numberIdSchema }),
	includeSchema,
])

export const specialImdbInputSchema = v.intersect([
	v.object({ id: imdbIdSchema }),
	includeSchema,
])

export type SpecialQuery = v.InferOutput<typeof specialInputSchema>
