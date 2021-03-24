/* eslint-disable @typescript-eslint/naming-convention */
import { envsafe, port, str } from 'envsafe'

export enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export const config = envsafe({
  NODE_ENV: str({
    choices: [
      Environment.Development,
      Environment.Test,
      Environment.Production,
    ],
    default: Environment.Development,
  }),
  PORT: port({
    devDefault: 3000,
  }),
  LOG_LEVEL: str({
    default: 'info',
    devDefault: 'debug',
    choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
  }),
  USER_AGENT: str({
    default: 'arm-server',
  }),
})
