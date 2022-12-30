import { JSONSchema7 } from "json-schema"

import { Source } from "@/db"
import {
  imdbSourceSchema,
  numberIdSourceSchema,
  stringIdSourceSchema,
} from "@/routes/v2/schemas/common"
import { imdbIdSchema, numberIdSchema, stringIdSchema } from "@/shared-schemas"

export type QueryParamQuery = {
  source: Source
  id: number | string
}

export const queryInputSchema: JSONSchema7 = {
  oneOf: [
    {
      type: "object",
      properties: {
        source: numberIdSourceSchema,
        id: numberIdSchema,
      },
      required: ["source", "id"],
    },
    {
      type: "object",
      properties: {
        source: stringIdSourceSchema,
        id: stringIdSchema,
      },
      required: ["source", "id"],
    },
    {
      type: "object",
      properties: {
        source: imdbSourceSchema,
        id: imdbIdSchema,
      },
      required: ["source", "id"],
    },
  ],
}
