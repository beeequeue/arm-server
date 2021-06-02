import request from 'supertest'

import { App } from '@/app'
import { knex, Relation } from '@/db'
import { Source } from '@/routes/handlers/common'

let id = 0
const createRelations = async <N extends number>(
  amount: N,
): Promise<N extends 1 ? Relation : Relation[]> => {
  const relations: Relation[] = Array.from({ length: amount }).map(() => {
    const r = {
      anilist: id,
      anidb: id + 1,
      kitsu: id + 2,
      myanimelist: id + 3,
    }

    id += 4

    return r
  })

  await knex.insert(relations).into('relations')

  if (amount === 1) {
    return relations[0] as any
  }

  return relations as any
}

const server = App.listen()

afterAll(() => {
  server.close()
})

afterEach(() => knex.delete().from('relations'))

describe('query params', () => {
  test('fetches relation correctly', async () => {
    const relation = await createRelations(1)

    return request(server)
      .get('/api/ids')
      .query({
        source: Source.AniList,
        id: relation.anilist,
      })
      .expect(200, relation)
      .expect('Content-Type', /json/)
  })

  test("returns null when id doesn't exist", async () =>
    request(server)
      .get('/api/ids')
      .query({
        source: Source.Kitsu,
        id: 404,
      })
      .expect(200, null))
})

describe('json body', () => {
  describe('object input', () => {
    test('fetches a single relation', async () => {
      const relations = await createRelations(4)

      const body = {
        [Source.AniDB]: relations[0].anidb,
      }

      return request(server)
        .post('/api/ids')
        .send(body)
        .expect(relations[0])
        .expect('Content-Type', /json/)
    })

    test('errors correctly on an empty object', async () => {
      await createRelations(4)

      const response = {
        code: 400,
        error: 'Bad Request',
        validation: '"value" must have at least 1 key',
      }

      return request(server)
        .post('/api/ids')
        .send({})
        .expect(400, response)
        .expect('Content-Type', /json/)
    })

    test('returns null if not found', async () => {
      await createRelations(4)

      return request(server)
        .post('/api/ids')
        .send({ anidb: 100_000 })
        .expect(200, null)
        .expect('Content-Type', /json/)
    })
  })

  describe('array input', () => {
    test('fetches relations correctly', async () => {
      const relations = await createRelations(4)

      const body = [
        { [Source.AniDB]: relations[0].anidb },
        { [Source.AniList]: 1000 },
        { [Source.Kitsu]: relations[2].kitsu },
      ]

      const result = [relations[0], null, relations[2]]

      return request(server)
        .post('/api/ids')
        .send(body)
        .expect(result)
        .expect('Content-Type', /json/)
    })

    test('responds correctly on no finds', async () => {
      const body = [{ [Source.AniList]: 1000 }, { [Source.Kitsu]: 1000 }]

      const result = [null, null]

      return request(server)
        .post('/api/ids')
        .send(body)
        .expect(result)
        .expect('Content-Type', /json/)
    })

    test('requires at least one source', async () => {
      const body = [{}]

      return request(server)
        .post('/api/ids')
        .send(body)
        .expect(400)
        .expect('Content-Type', /json/)
    })
  })
})
