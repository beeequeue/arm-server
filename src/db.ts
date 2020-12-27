import Knex from 'knex'
import { config } from '../knexfile'

const { NODE_ENV } = process.env
export const knex = Knex(
  config[(NODE_ENV as 'development' | 'production' | 'test') ?? 'production'],
)

console.log(`Using ${NODE_ENV} configuration...`)

export interface Relation {
  anilist?: number
  anidb?: number
  myanimelist?: number
  kitsu?: number
}
