import { z } from "zod"

import { numberIdSchema } from "../../../../shared-schemas.js"
import { includeSchema } from "../../include.js"

export const thetvdbInputSchema = z
  .object({
    id: numberIdSchema,
  })
  .and(includeSchema)

export type TheTVDBQuery = z.infer<typeof thetvdbInputSchema>
