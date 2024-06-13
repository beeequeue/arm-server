import { z } from "zod"
import { numberIdSchema, oldSourceSchema } from "@/shared-schemas"

export const queryInputSchema = z.object({
  source: oldSourceSchema,
  id: numberIdSchema,
})

export type QueryParamQuery = z.infer<typeof queryInputSchema>
