import { spawn } from 'child_process'
import { resolve } from 'path'
import { captureException, init } from '@sentry/node'

import { App } from './app'

const { NODE_ENV } = process.env
const port = process.env.PORT ?? 3000

init({
  dsn: 'https://a1c2b4d9841046bd9d7d154c9a6be149@sentry.io/1380324',
  enabled: NODE_ENV === 'production',
})

const runUpdateScript = async () => {
  const tsNode = resolve(__dirname, '..', 'node_modules', '.bin', 'ts-node')
  const script = resolve(__dirname, '..', 'bin', 'update.ts')

  const { stdout, stderr } = spawn(tsNode, ['-T', script])

  stdout.on('data', data => console.log(data.toString().trim()))
  stderr.on('data', data => console.error(data.toString().trim()))
}

const listen = async () => {
  if (NODE_ENV === 'production') {
    await runUpdateScript()

    setInterval(runUpdateScript, 1000 * 60 * 60 * 24)
  }

  App.listen(port, () => {
    console.log(`Listening on ${port}`)
  })

  App.on('error', err => {
    console.warn(err)
    captureException(err)
  })
}

listen()
