import Joi from 'joi'

import { idSchema, Source, sourceArray } from '@/routes/handlers/common'
import { knex, Relation } from '@/db'

type BodyItem = {
  [key in Source]?: number
}

const bodyItemSchema = Joi.object(
  sourceArray.reduce(
    (obj, source) => ({
      ...obj,
      [source as any]: idSchema.optional(),
    }),
    {},
  ),
)
  .min(1)
  .required()

export type BodyQuery = BodyItem | BodyItem[]

const arraySchema = Joi.array().min(1).max(100).items(bodyItemSchema).required()

export const bodySchema = Joi.alternatives(arraySchema, bodyItemSchema)

export const bodyHandler = async (
  input: BodyQuery,
): Promise<
  BodyQuery extends Array<undefined> ? Array<Relation | null> : Relation
> => {
  if (!Array.isArray(input)) {
    const relation = await knex.where(input).from('relations').first()

    console.log(relation)

    return relation ?? null
  }

  let relations: Array<Relation | null> = ([] = [])

  // Get relations
  relations = await knex
    .where(function () {
      input.forEach((item) => this.orWhere(item))
    })
    .from('relations')

  // Map them against the input, so we get results like [{item}, null, {item}]
  relations = input.map((item) => {
    const realItem = Object.entries(item)[0] as [Source, number]

    return (
      relations.find((relation) => relation![realItem[0]] === realItem[1]) ??
      null
    )
  })

  return relations as any
}
