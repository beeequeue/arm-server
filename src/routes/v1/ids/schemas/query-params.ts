import { z } from "zod"
import { numberIdSchema, oldSourceSchema } from "../../../../shared-schemas.js"

export const queryInputSchema = z.object({
  source: oldSourceSchema,
  id: numberIdSchema,
})

export type QueryParamQuery = z.infer<typeof queryInputSchema>
