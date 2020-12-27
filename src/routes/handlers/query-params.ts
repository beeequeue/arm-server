import Joi from 'joi'

import { idSchema, Source, sourceArray } from '@/routes/handlers/common'
import { knex } from '@/db'

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
    .from('relations')
    .first()
}
