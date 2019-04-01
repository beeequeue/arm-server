import Knex, { CreateTableBuilder } from 'knex'
import config from '../knexfile'

const { NODE_ENV } = process.env
export const knex = Knex(config[NODE_ENV as 'development' | 'production'])

export interface Relation {
  anilist?: number
  anidb?: number
  myanimelist?: number
  kitsu?: number
}

/**
 * Checks if a table exists, and creates it if it doesn't.
 */
const createTableIfDoesNotExist = async (
  name: string,
  cb: (tableBuilder: CreateTableBuilder) => void
) => {
  if (await knex.schema.hasTable(name)) return

  console.log(`Creating table ${name}`)

  await knex.schema.createTable(name, cb)
}

const initialize = async () => {
  const promises: Promise<any>[] = []

  promises.push(
    createTableIfDoesNotExist('relations', table => {
      table.integer('anilist').unique()
      table.integer('anidb').unique()
      table.integer('myanimelist').unique()
      table.integer('kitsu').unique()
    })
  )

  await Promise.all(promises)
}

initialize()
