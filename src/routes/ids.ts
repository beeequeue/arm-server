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

interface Schema {
  source: Source
  id: number
}

const querySchema = Joi.object().keys({
  source: Joi.string()
    .valid(enumToArray(Source))
    .required(),
  id: Joi.number()
    .min(0)
    .max(2147483647)
    .precision(0)
    .required(),
})

const arraySchema = Joi.array()
  .min(1)
  .max(100)
  .items(querySchema)
  .required()

type EitherSchema = Schema | Schema[]

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
    const items = query.map(({ source, id }) => ({ [source]: id }))

    // Get relations
    relations = await knex
      .where(function() {
        items.forEach(item => this.orWhere(item))
      })
      .from('relations')

    // Map them against the input, so we get results like [{item}, null, {item}]
    relations = query.map(
      item =>
        relations.find(relation => relation![item.source] === item.id) || null
    )
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
