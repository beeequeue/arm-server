import * as v from "valibot"

import { numberIdSchema, oldSourceSchema } from "../../../../shared-schemas.ts"

export const queryInputSchema = v.pipe(
	v.object({
		source: oldSourceSchema,
		id: numberIdSchema,
	}),
	v.check((data) => Object.keys(data).length > 0, "At least one source is required."),
)

export type QueryParamQuery = v.InferOutput<typeof queryInputSchema>
