import { z } from "zod"

import type { Source } from "../../../../db.js"
import { numberIdSchema, oldSourceSchema } from "../../../../shared-schemas.js"

export const singularItemInputSchema = z
	.record(oldSourceSchema, numberIdSchema)
	.refine((data) => Object.keys(data).length > 0, "At least one source is required.")

const arrayInputSchema = z
	.array(singularItemInputSchema)
	.refine((data) => data.length > 0, "At least one source is required.")

export const bodyInputSchema = z.union([singularItemInputSchema, arrayInputSchema])

type BodyItem = {
	[key in Source]?: number
}

export type BodyQuery = BodyItem | BodyItem[]
