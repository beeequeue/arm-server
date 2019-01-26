import Superagent from 'superagent'
import { RequestResponse, responseIsError } from './utils'
import { captureException } from '@sentry/node'
import { knex, Relation } from './db'

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

    const anidbMatch = src.match(/anidb.net\/(.+)$/)
    if (anidbMatch) {
      relation.anidb = anidbMatch[1]
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
  await knex.delete().from('relations')
  await knex.batchInsert('relations', formattedEntries, 250)
  console.log('Updated database...')
}
