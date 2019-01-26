import Koa from 'koa'
import BodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import { init, captureException } from '@sentry/node'

const { NODE_ENV } = process.env
const port = process.env.PORT || 3000
const app = new Koa()
const router = new Router()

init({
  dsn: 'https://a1c2b4d9841046bd9d7d154c9a6be149@sentry.io/1380324',
  enabled: NODE_ENV === 'production',
})

app.use(BodyParser())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(port, () => {
  console.log(`Listening on ${port}`)
})

app.on('error', err => {
  captureException(err)
})
