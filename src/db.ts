import Knex from 'knex'

import { config } from '../knexfile'

import { Logger } from './lib/logger'

const { NODE_ENV } = process.env
export const knex = Knex(
  config[(NODE_ENV as 'development' | 'production' | 'test') ?? 'production'],
)

Logger.info(`Using ${NODE_ENV!} configuration...`)

export type Relation = {
  anilist?: number
  anidb?: number
  myanimelist?: number
  kitsu?: number
}
