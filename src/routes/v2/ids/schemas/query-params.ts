import { z } from "zod"

import { numberIdSchema, stringIdSchema } from "../../../../shared-schemas.js"
import { includeSchema } from "../../include.js"

import { numberIdSourceSchema, stringIdSourceSchema } from "./common.js"

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
