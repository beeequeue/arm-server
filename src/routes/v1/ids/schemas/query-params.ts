import { z } from "zod"

import { numberIdSchema, oldSourceSchema } from "../../../../shared-schemas.ts"

export const queryInputSchema = z
	.object({
		source: oldSourceSchema,
		id: numberIdSchema,
	})
	.refine((data) => Object.keys(data).length > 0, "At least one source is required.")

export type QueryParamQuery = z.infer<typeof queryInputSchema>
