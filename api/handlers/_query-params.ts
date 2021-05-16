import Joi from "joi"

import { idSchema, Source, sourceArray } from "./_common"

export type QueryParamInput = {
  source: Source
  id: number
}

export const querySchema = Joi.object({
  source: Joi.string()
    .valid(...sourceArray)
    .required(),
  id: idSchema,
})
