import { createSchema as S } from "ts-json-validator"

import { idSchema, sourceSchema } from "@/schemas/common"

const nullSchema = S({ type: "null" })

const responseItemSchema = S({
  type: "object",
  propertyNames: sourceSchema,
  additionalProperties: idSchema,
})

const responseArraySchema = S({
  type: "array",
  items: S({
    oneOf: [nullSchema, responseItemSchema],
  }),
})

export const responseBodySchema = S({
  oneOf: [nullSchema, responseItemSchema, responseArraySchema],
})
