import { z } from "zod"

import { numberIdSchema } from "../../../../shared-schemas.js"
import { includeSchema } from "../../include.js"

export const specialInputSchema = z
	.object({
		id: numberIdSchema,
	})
	.and(includeSchema)

export type SpecialQuery = z.infer<typeof specialInputSchema>
