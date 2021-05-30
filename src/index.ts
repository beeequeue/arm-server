import { captureException } from '@sentry/node'

import { Logger } from '@/lib/logger'

import { App } from './app'
import { updateRelations } from './update'

const { NODE_ENV } = process.env
const port = process.env.PORT ?? 3000

const runUpdateScript = () => updateRelations().catch(captureException)

const listen = () => {
  if (NODE_ENV === 'production') {
    void runUpdateScript()

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(runUpdateScript, 1000 * 60 * 60 * 24)
  }

  App.listen(port, () => {
    Logger.info(`Listening on ${port}`)
  })
}

listen()
