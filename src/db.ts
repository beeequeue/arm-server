import Knex, { CreateTableBuilder } from 'knex'
import { dbConfig } from './config'

export const knex = Knex(dbConfig)

export interface Relation {
  anilist?: number
  anidb?: number
  myanimelist?: number
  kitsu?: number
}

/**
 * Checks if a table exists, and creates it if it doesn't.
 * Always adds a `uuid` column.
 */
const createTableIfDoesNotExist = async (
  name: string,
  cb: (tableBuilder: CreateTableBuilder) => void
) => {
  try {
    await knex(name).count('anilist')
  } catch (e) {
    if (e.routine !== 'parserOpenTable') {
      throw new Error(e)
    }

    console.log(`Creating table ${name}`)

    await knex.schema.createTable(name, cb)
  }
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
