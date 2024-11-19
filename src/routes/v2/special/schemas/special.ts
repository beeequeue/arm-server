import { z } from "zod"

import { imdbIdSchema, numberIdSchema } from "../../../../shared-schemas.ts"
import { includeSchema } from "../../include.ts"

export const specialInputSchema = z.object({ id: numberIdSchema }).and(includeSchema)

export const specialImdbInputSchema = z.object({ id: imdbIdSchema }).and(includeSchema)

export type SpecialQuery = z.infer<typeof specialInputSchema>
