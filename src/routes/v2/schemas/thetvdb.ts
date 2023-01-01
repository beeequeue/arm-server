import { JSONSchema7 } from "json-schema"

import { numberIdSchema } from "@/shared-schemas"

export type TheTVDBQuery = {
  id: number
}

export const thetvdbInputSchema: JSONSchema7 = {
  type: "object",
  properties: {
    id: numberIdSchema,
  },
  required: ["id"],
}
