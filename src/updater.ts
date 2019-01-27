import Superagent from 'superagent'
import { captureException } from '@sentry/node'
import debug from 'debug'

import { knex, Relation } from './db'
import { updateBasedOnManualRules } from './manual-rules'
import { RequestResponse, responseIsError } from './utils'

const log = debug('app:updater')

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

export const updateRelations = async () => {
  log('Fetching updated Database...')
  const data = await fetchDatabase()
  log('Fetched updated Database.')

  if (data == null) {
    log('got no data')
    return
  }

  log('Formatting data...')
  const formattedEntries = data.map(formatEntry)
  log('Formatted data.')

  log('Updating database...')
  try {
    await knex.transaction(trx =>
      knex
        .delete()
        .from('relations')
        .transacting(trx)
        .then(() =>
          knex.batchInsert('relations', formattedEntries, 250).transacting(trx)
        )
    )
  } catch (e) {
    throw new Error(e)
  }
  log('Updated database.')

  log('Executing manual rules...')
  await updateBasedOnManualRules()
  log('Finished.')
}
