import * as v from "valibot"

import { numberIdSchema, stringIdSchema } from "../../../../shared-schemas.ts"
import { includeSchema } from "../../include.ts"

import { numberIdSourceSchema, stringIdSourceSchema } from "./common.ts"

export const queryInputSchema = v.intersect([
	v.union([
		v.object({
			source: numberIdSourceSchema,
			id: numberIdSchema,
		}),
		v.object({
			source: stringIdSourceSchema,
			id: stringIdSchema,
		}),
	]),
	includeSchema,
])

export type QueryParamQuery = v.InferOutput<typeof queryInputSchema>
