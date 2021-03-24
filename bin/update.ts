import Superagent from 'superagent'

import { captureException } from '@sentry/node'

import { knex, Relation } from '../src/db'
import { Logger } from '../src/lib/logger'
import { updateBasedOnManualRules } from '../src/manual-rules'
import { RequestResponse, responseIsError } from '../src/utils'

type OfflineDatabaseSchema = {
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
    'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json',
  ).ok(() => true)) as RequestResponse<{ data: OfflineDatabaseSchema[] }>

  if (responseIsError(response)) {
    Logger.error('Could not fetch updated database!!')
    captureException(new Error('Could not fetch updated database!!'))

    return null
  }

  return JSON.parse(response.text).data
}

const regexes = {
  anilist: /anilist.co\/anime\/(\d+)$/,
  anidb: /anidb.net\/a(?:nime\/)?(\d+)$/,
  mal: /myanimelist.net\/anime\/(\d+)$/,
  kitsu: /kitsu.io\/anime\/(.+)$/,
}

const formatEntry = (entry: OfflineDatabaseSchema): Relation => {
  const relation: Relation = {}

  entry.sources.forEach((src) => {
    const anilistMatch = regexes.anilist.exec(src)
    if (anilistMatch) {
      const id = Number(anilistMatch[1])

      if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.anilist = id
    }

    const anidbMatch = regexes.anidb.exec(src)
    if (anidbMatch) {
      const id = Number(anidbMatch[1])

      if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.anidb = id
    }

    const malMatch = regexes.mal.exec(src)
    if (malMatch) {
      const id = Number(malMatch[1])

      if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.myanimelist = id
    }

    const kitsuMatch = regexes.kitsu.exec(src)
    if (kitsuMatch) {
      const id = Number(kitsuMatch[1])

      if (isNaN(id)) throw new Error(`${src}'s ID is not a number!!`)

      relation.kitsu = id
    }
  })

  return relation
}

const updateRelations = async () => {
  Logger.info(`Using ${process.env.NODE_ENV!} database configuration...`)

  Logger.info('Fetching updated Database...')
  const data = await fetchDatabase()
  Logger.info('Fetched updated Database.')

  if (data == null) {
    Logger.info('got no data')
    return
  }

  Logger.info('Formatting data...')
  const formattedEntries = data.map(formatEntry)
  Logger.info('Formatted data.')

  Logger.info('Updating database...')
  try {
    await knex.transaction((trx) =>
      knex
        .delete()
        .from('relations')
        .transacting(trx)
        .then(() =>
          knex.batchInsert('relations', formattedEntries, 100).transacting(trx),
        ),
    )
  } catch (e) {
    throw new Error(e)
  }
  Logger.info('Updated database.')

  Logger.info('Executing manual rules...')
  await updateBasedOnManualRules()

  await knex.destroy()
  Logger.info('Done.')
}

updateRelations().catch(captureException)
