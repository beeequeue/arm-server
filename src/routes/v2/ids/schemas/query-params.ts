import { z } from "zod"

import { imdbIdSchema, numberIdSchema, stringIdSchema } from "../../../../shared-schemas.js"
import { includeSchema } from "../../include.js"
import { imdbSourceSchema, numberIdSourceSchema, stringIdSourceSchema } from "./common.js"

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
    z.object({
      source: imdbSourceSchema,
      id: imdbIdSchema,
    }),
  ])
  .and(includeSchema)

export type QueryParamQuery = z.infer<typeof queryInputSchema>
