import Router from 'koa-router'

import { singleRoutes } from './ids'

const router = new Router()

router.prefix('/api')

router.use(singleRoutes)

export const routes = router.routes()
