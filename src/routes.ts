import { Context } from 'koa'
import Router from 'koa-router'
import Joi from 'joi'

import { knex } from './db'
import { enumToArray } from './utils'

const table = () => knex('arm')
const router = new Router()

enum Source {
  ANILIST = 'anilist',
  ANIDB = 'anidb',
  MAL = 'myanimelist',
  KITSU = 'kitsu',
}

router.prefix('/api')
const querySchema = Joi.object().keys({
  source: Joi.string()
    .valid(enumToArray(Source))
    .required(),
  id: Joi.number()
    .positive()
    .precision(0)
    .required(),
})

router.get('/ids', async (ctx: Context) => {
  let query

  try {
    query = await Joi.validate(ctx.query, querySchema, {
      stripUnknown: true,
    })
  } catch (e) {
    if (e.isJoi !== true) {
      throw new Error(e)
    }

    ctx.status = 400
    ctx.body = {
      code: 400,
      error: 'BadRequest',
      messages: e.details.map(({ message }: any) => message)
    }

    return
  }

  table()

  ctx.body = query
})

export const routes = router.routes()
