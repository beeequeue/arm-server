import Joi from "joi"

import { idSchema, sourceArray } from "./_common"

export const querySchema = Joi.object({
  source: Joi.string()
    .valid(...sourceArray)
    .required(),
  id: idSchema,
})
