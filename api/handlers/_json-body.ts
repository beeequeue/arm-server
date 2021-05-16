import Joi from "joi"

import { idSchema, sourceArray } from "./_common"

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

const arraySchema = Joi.array().min(1).max(100).items(bodyItemSchema).required()

export const bodySchema = Joi.alternatives(arraySchema, bodyItemSchema)
