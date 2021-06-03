import Joi from "joi"

import { knex } from "@/db"
import { idSchema, Source, sourceArray } from "@/routes/handlers/common"

export type QueryParamQuery = {
  source: Source
  id: number
}

export const querySchema = Joi.object({
  source: Joi.string()
    .valid(...sourceArray)
    .required(),
  id: idSchema,
})

export const handleQueryParams = async (input: QueryParamQuery) => {
  return knex
    .where({ [input.source]: input.id })
    .from("relations")
    .first()
}
