import request from 'supertest'

import { App } from '@/app'
import { knex, Relation } from '@/db'
import { Source } from './ids'

let id = 0
const createRelations = async <N extends number>(
  amount: N
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

describe('single', () => {
  test('fetches relation correctly', async () => {
    const relation = await createRelations(1)

    return request(server)
      .get('/api/ids')
      .query({
        source: Source.ANILIST,
        id: relation.anilist,
      })
      .expect(200, relation)
      .expect('Content-Type', /json/)
  })

  test("returns null when id doesn't exist", async () =>
    request(server)
      .get('/api/ids')
      .query({
        source: Source.KITSU,
        id: 404,
      })
      .expect(204))
})

describe('multiple', () => {
  test('fetches relations correctly', async () => {
    const relations = await createRelations(4)

    const body = [
      { [Source.ANIDB]: relations[0].anidb },
      { [Source.ANILIST]: 1000 },
      { [Source.KITSU]: relations[2].kitsu },
    ]

    const result = [relations[0], null, relations[2]]

    return request(server)
      .get('/api/ids')
      .send(body)
      .expect(result)
      .expect('Content-Type', /json/)
  })

  test('responds correctly on no finds', async () => {
    const body = [{ [Source.ANILIST]: 1000 }, { [Source.KITSU]: 1000 }]

    const result = [null, null]

    return request(server)
      .get('/api/ids')
      .send(body)
      .expect(result)
      .expect('Content-Type', /json/)
  })

  test('requires at least one source', async () => {
    const body = [{}]

    return request(server)
      .get('/api/ids')
      .send(body)
      .expect(400)
      .expect('Content-Type', /json/)
  })
})
