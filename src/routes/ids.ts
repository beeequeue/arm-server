import { Context } from 'koa'
import Router from 'koa-router'

import { bodyHandler, BodyQuery, bodySchema } from '@/routes/handlers/json-body'
import {
  handleQueryParams,
  QueryParamQuery,
  querySchema,
} from '@/routes/handlers/query-params'
import { isEmpty } from '@/utils'

const router = new Router()

const getIds = async (ctx: Context) => {
  const isBodyQuery = isEmpty(ctx.query)
  const unvalidatedInput = isBodyQuery ? ctx.request.body : ctx.query

  const result = (isBodyQuery ? bodySchema : querySchema).validate(
    unvalidatedInput,
    {
      stripUnknown: true,
      abortEarly: false,
    },
  )

  if (result.error) {
    if (!result.error.isJoi) {
      throw result.error
    }

    ctx.status = 400
    ctx.body = {
      code: 400,
      error: 'Bad Request',
      validation: result.error.message,
    }

    return
  }

  const input = result.value as QueryParamQuery | BodyQuery

  if (isBodyQuery) {
    ctx.body = await bodyHandler(input as BodyQuery)
  } else {
    ctx.body = await handleQueryParams(input as QueryParamQuery)
  }

  if (ctx.body == null) {
    ctx.response.status = 200
    ctx.response.type = 'json'
    ctx.body = 'null'
  }
}

router.get('/ids', getIds)
router.post('/ids', getIds)

export const singleRoutes = router.routes()
