import request from 'supertest'

import { App } from '@/app'
import { knex } from '@/db'
import { Source } from './ids'

const server = App.listen()

afterAll(() => {
  server.close()
})

afterEach(() => knex.delete().from('relations'))

test('fetches relations correctly', async () => {
  const relation = {
    myanimelist: 1337,
    anilist: 1337,
    anidb: 79352,
    kitsu: null,
  }

  await knex.insert(relation).into('relations')

  return request(server)
    .get('/api/ids')
    .query({
      source: Source.ANILIST,
      id: 1337,
    })
    .expect(200, relation)
    .expect('Content-Type', /json/)
})

test("returns 404 when id doesn't exist", async () =>
  request(server)
    .get('/api/ids')
    .query({
      source: Source.KITSU,
      id: 404,
    })
    .expect(404, {
      code: 404,
      error: 'NotFound',
      messages: ['Could not find entry with that ID.'],
    })
    .expect('Content-Type', /json/))
