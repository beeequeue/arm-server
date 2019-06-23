#!../node_modules/.bin/ts-node

import Superagent from 'superagent'
import { captureException } from '@sentry/node'

import { knex, Relation } from '../src/db'
import { updateBasedOnManualRules } from '../src/manual-rules'
import { RequestResponse, responseIsError } from '../src/utils'

interface OfflineDatabaseSchema {
  sources: string[]
  type: string
  title: string
  picture: string
  relations: string[]
  thumbnail: string
  episodes: number
  synonyms: string[]
}

const fetchDatabase = async (): Promise<OfflineDatabaseSchema[] | null> => {
  const response = (await Superagent.get(
    'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json'
  ).ok(() => true)) as RequestResponse<{ data: OfflineDatabaseSchema[] }>

  if (responseIsError(response)) {
    console.error('Could not fetch updated database!!')
    captureException(new Error('Could not fetch updated database!!'))

    return null
  }

  return JSON.parse(response.text).data
}

const formatEntry = (entry: OfflineDatabaseSchema): Relation => {
  const relation: Relation = {}

  entry.sources.forEach(src => {
    const anilistMatch = src.match(/anilist.co\/anime\/(.+)$/)
    if (anilistMatch) {
      const id = Number(anilistMatch[1])

      if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.anilist = id
    }

    const anidbMatch = src.match(/anidb.net\/a(.+)$/)
    if (anidbMatch) {
      const id = Number(anidbMatch[1])

      if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.anidb = id
    }

    const malMatch = src.match(/myanimelist.net\/anime\/(.+)$/)
    if (malMatch) {
      const id = Number(malMatch[1])

      if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.myanimelist = id
    }

    const kitsuMatch = src.match(/kitsu.io\/anime\/(.+)$/)
    if (kitsuMatch) {
      const id = Number(kitsuMatch[1])

      if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.kitsu = id
    }
  })

  return relation
}

const updateRelations = async () => {
  console.log(`Using ${process.env.NODE_ENV} database configuration...`)

  console.log('Fetching updated Database...')
  const data = await fetchDatabase()
  console.log('Fetched updated Database.')

  if (data == null) {
    console.log('got no data')
    return
  }

  console.log('Formatting data...')
  const formattedEntries = data.map(formatEntry)
  console.log('Formatted data.')

  console.log('Updating database...')
  try {
    await knex.transaction(trx =>
      knex
        .delete()
        .from('relations')
        .transacting(trx)
        .then(() =>
          knex.batchInsert('relations', formattedEntries, 100).transacting(trx)
        )
    )
  } catch (e) {
    throw new Error(e)
  }
  console.log('Updated database.')

  console.log('Executing manual rules...')
  await updateBasedOnManualRules()

  await knex.destroy()
}

updateRelations()
