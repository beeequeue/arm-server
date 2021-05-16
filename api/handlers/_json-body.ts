import Joi from "joi"

import { idSchema, Source, sourceArray } from "./_common"

type BodyItem = {
  [key in Source]?: number
}

const bodyItemSchema = Joi.object(
  sourceArray.reduce(
    (obj, source) => ({
      ...obj,
      [source]: idSchema.optional(),
    }),
    {},
  ),
)
  .min(1)
  .required()

export type BodyInput = BodyItem | BodyItem[]

const arraySchema = Joi.array().min(1).max(100).items(bodyItemSchema).required()

export const bodySchema = Joi.alternatives(arraySchema, bodyItemSchema)
