import { Context } from 'koa'
import Router from 'koa-router'
import Joi from 'joi'

import { knex, Relation } from '@/db'
import { enumToArray, isEmpty } from '@/utils'

const router = new Router()

export enum Source {
  ANILIST = 'anilist',
  ANIDB = 'anidb',
  MAL = 'myanimelist',
  KITSU = 'kitsu',
}

type Entry = {
  [key in Source]: number | null
}

const sourceArray = (enumToArray(Source) as unknown) as string[]

interface Schema {
  source: Source
  id: number
}

const idSchema = Joi.number()
  .min(0)
  .max(2147483647)
  .precision(0)
  .required()

const querySchema = Joi.object({
  source: Joi.string()
    .valid(sourceArray)
    .required(),
  id: idSchema,
})

const arrayItemSchema = sourceArray.reduce(
  (obj, source) => ({
    ...obj,
    [source as any]: idSchema.optional(),
  }),
  {}
)

const arraySchema = Joi.array()
  .min(1)
  .max(100)
  .items(Joi.object(arrayItemSchema).or(...sourceArray))
  .required()

type EitherSchema = Schema | Entry[]

const eitherSchema = Joi.alternatives(querySchema, arraySchema)

router.get('/ids', async (ctx: Context) => {
  const input = !isEmpty(ctx.request.body) ? ctx.request.body : ctx.query
  let query: EitherSchema

  try {
    query = await eitherSchema.validate(input, {
      stripUnknown: true,
      abortEarly: false,
    })
  } catch (e) {
    if (e.isJoi !== true) {
      throw new Error(e)
    }

    ctx.status = 400
    ctx.body = {
      code: 400,
      error: 'Bad Request',
      messages: e.details.map(({ path, message }: any) => ({
        path,
        message: message.replace(/"/g, "'"),
      })),
    }

    return
  }

  let relation: Relation | null = null
  let relations: Array<Relation | null> = []

  if (Array.isArray(query)) {
    // Get relations
    relations = await knex
      .where(function() {
        ;(query as Entry[]).forEach(item => this.orWhere(item))
      })
      .from('relations')

    // Map them against the input, so we get results like [{item}, null, {item}]
    relations = query.map(item => {
      const realItem = Object.entries(item)[0] as [Source, number]

      return (
        relations.find(relation => relation![realItem[0]] === realItem[1]) ||
        null
      )
    })
  } else {
    relation = await knex
      .where({ [query.source]: query.id })
      .from('relations')
      .first()
  }

  if (relation == null && relations.length < 1) {
    ctx.status = 404
    ctx.body = {
      code: 404,
      error: 'NotFound',
      messages: ['Could not find any entries with the provided filters.'],
    }

    return
  }

  ctx.body = relation || relations
})

export const singleRoutes = router.routes()
