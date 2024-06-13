import type { JSONSchema7 } from "json-schema"

import { makeNullable, numberIdSchema } from "@/shared-schemas"

const nullableIdSchema = makeNullable(numberIdSchema)

export const responseItemSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  properties: {
    anidb: nullableIdSchema,
    anilist: nullableIdSchema,
    myanimelist: nullableIdSchema,
    kitsu: nullableIdSchema,
  },
}

const responseArraySchema: JSONSchema7 = {
  type: "array",
  items: makeNullable(responseItemSchema),
}

export const responseBodySchema: JSONSchema7 = makeNullable(
  responseItemSchema,
  responseArraySchema,
)
