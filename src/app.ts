import Koa, { Context } from 'koa'
import BodyParser from 'koa-bodyparser'
import Router from 'koa-router'

import { routes } from './routes'

export const App = new Koa()
const router = new Router()

App.use(BodyParser())

router.get('/', (ctx: Context) => {
  ctx.body = `
Usage:
GET /api/ids?source={anilist|anidb|myanimelist|kitsu}&id={number}

Returns:
{
  anilist?: number
  anidb?: number
  myanimelist?: number
  kitsu?: number
}
`
})

router.use(routes)

App.use(router.routes())
App.use(router.allowedMethods())
