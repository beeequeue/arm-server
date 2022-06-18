import { JSONSchema7 } from "json-schema"

import { idSchema } from "@/schemas/common"

const nullSchema: JSONSchema7 = { type: "null" }

const nullableIdSchema = {
  oneOf: [nullSchema, idSchema],
}

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
  items: {
    oneOf: [nullSchema, responseItemSchema],
  },
}

export const responseBodySchema: JSONSchema7 = {
  oneOf: [nullSchema, responseItemSchema, responseArraySchema],
}
