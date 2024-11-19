import { z } from "zod"

import { numberIdSchema, stringIdSchema } from "../../../../shared-schemas.ts"
import { includeSchema } from "../../include.ts"

import { numberIdSourceSchema, stringIdSourceSchema } from "./common.ts"

export const queryInputSchema = z
	.union([
		z.object({
			source: numberIdSourceSchema,
			id: numberIdSchema,
		}),
		z.object({
			source: stringIdSourceSchema,
			id: stringIdSchema,
		}),
	])
	.and(includeSchema)

export type QueryParamQuery = z.infer<typeof queryInputSchema>
