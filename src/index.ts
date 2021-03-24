import { spawn } from 'child_process'
import { resolve } from 'path'

import { captureException } from '@sentry/node'

import { App } from './app'

const { NODE_ENV } = process.env
const port = process.env.PORT ?? 3000

const runUpdateScript = () => {
  const tsNode = resolve(__dirname, '..', 'node_modules', '.bin', 'ts-node')
  const script = resolve(__dirname, '..', 'bin', 'update.ts')

  const { stdout, stderr } = spawn(tsNode, ['-T', script])

  stdout.on('data', (data) => console.log(data.toString().trim()))
  stderr.on('data', (data) => {
    captureException(data.toString().trim())
    console.error(data.toString().trim())
  })
}

const listen = () => {
  if (NODE_ENV === 'production') {
    runUpdateScript()

    setInterval(runUpdateScript, 1000 * 60 * 60 * 24)
  }

  App.listen(port, () => {
    console.log(`Listening on ${port}`)
  })
}

listen()
