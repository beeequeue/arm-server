import Koa, { Context } from 'koa'
import BodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import Logger from 'koa-logger'

import { routes } from './routes'
import { requestHandler, sendErrorToSentry, tracingMiddleWare } from '@/sentry'

export const App = new Koa()
const router = new Router()

App.use(Logger())

App.use(requestHandler)
App.use(tracingMiddleWare)

App.on('error', (err, ctx) => {
  console.error(err)

  sendErrorToSentry(err, ctx)
})

App.use(BodyParser())

router.get('/', (ctx: Context) => {
  ctx.body = `
<pre>
<b>Get IDs:</b>
<b>GET/POST /api/ids</b>

enum Source {
  anilist,
  anidb,
  myanimelist,
  kitsu,
}

<b>Either use GET query parameters:</b>
?source={Source}&id={number}

<b>or send the query as a POST JSON body:</b>

{ "anilist": 1337 }

[{ "anilist": 1337 }, { "anilist": 69 }, { "anidb": 420 }]

interface Entry {
  anilist: number | null
  anidb: number | null
  myanimelist: number | null
  kitsu: number | null
}

{ "anilist": 1337 } => Entry | null
[{ ... }] => Array<Entry | null>

<b>The response code will always be 200 (OK).
If an entry is not found null is returned instead.</b>

Source code is available on GitHub at <a href="https://github.com/BeeeQueue/arm-server">https://github.com/BeeeQueue/arm-server</a>
</pre>
`
})

router.use(routes)

App.use(router.routes())
App.use(router.allowedMethods())
