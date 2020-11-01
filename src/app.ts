import Koa, { Context } from 'koa'
import BodyParser from 'koa-bodyparser'
import Connect from 'koa-connect'
import Router from 'koa-router'
import Logger from 'koa-logger'
import { Handlers } from '@sentry/node'

import { routes } from './routes'

export const App = new Koa()
const router = new Router()

App.use(Logger())

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
App.use(Connect(Handlers.requestHandler()))
// TracingHandler creates a trace for every incoming request
App.use(Connect(Handlers.tracingHandler()))

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

[{ "anilist": 1337, "anilist": 69, "anidb": 420 }]

interface Entry {
  anilist: number | null
  anidb: number | null
  myanimelist: number | null
  kitsu: number | null
}

{ "anilist": 1337 } => Entry | null
[{ ... }] => (Entry | null)[]

<b>The response code will always be 200 (OK) or 204 (No content).
If an entry is not found null is returned instead.</b>

Source code is available on GitHub at https://github.com/BeeeQueue/arm-server
</pre>
`
})

router.use(routes)

App.use(router.routes())
App.use(router.allowedMethods())
