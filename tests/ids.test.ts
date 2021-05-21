import type { Server } from "http"
import { URLSearchParams } from "url"

import HttpClient, { Got, Response } from "got"
import listen from "test-listen"
import { createServer } from "vercel-node-server"

import { Relation, Source } from "../api/_types"
import IdFunction from "../api/ids"

import { cleanUpDb, insertRelations } from "./utils"

const createSnapshot = (
  input: { body?: unknown; searchParams?: URLSearchParams },
  { url, method, statusCode, headers: { date, ...headers }, body }: Response,
) => ({
  request: {
    url: url.replace(/localhost:\d+/, "localhost"),
    ...input,
  },
  response: {
    method,
    statusCode,
    headers,
    body,
  },
})

let server: Server
let baseUrl: string
let client: Got

beforeAll(async () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  server = createServer(IdFunction)
  baseUrl = await listen(server)

  client = HttpClient.extend({
    prefixUrl: baseUrl,
    responseType: "json",
    allowGetBody: true,
  })
})

beforeEach(async () => {
  await cleanUpDb()

  await insertRelations([{ anilist: 1337 }])
})

afterAll(
  () =>
    new Promise((resolve) => {
      server.close(resolve)
    }),
)

describe("query params", () => {
  test("returns 200 with null if not found", async () => {
    const searchParams = new URLSearchParams({
      source: Source.AniList,
      id: (1338).toString(),
    })

    const response = await client.get("api/ids", {
      searchParams,
      headers: {
        accept: "application/json",
      },
    })

    expect(createSnapshot({ searchParams }, response)).toMatchSnapshot()

    expect(response.headers["content-type"]).toBe("application/json")
    expect(response.body).toBe(null)
  })

  test("returns 200 with relation if found", async () => {
    const searchParams = new URLSearchParams({
      source: Source.AniList,
      id: (1337).toString(),
    })

    const response = await client.get<Relation | null>("api/ids", {
      searchParams,
    })

    expect(createSnapshot({ searchParams }, response)).toMatchSnapshot()
  })
})

describe("json body", () => {
  const methods = ["get", "post"] as const

  describe("single", () => {
    methods.forEach((method) => {
      describe(method.toUpperCase(), () => {
        test("returns 200 with null if not found", async () => {
          const body = {
            [Source.AniList]: 1338,
          }

          const response = await client[method]("api/ids", {
            json: body,
            headers: {
              accept: "application/json",
            },
          })

          expect(createSnapshot({ body }, response)).toMatchSnapshot()
        })

        test("returns 200 with relation if found", async () => {
          const body = {
            [Source.AniList]: 1337,
          }

          const response = await client[method]("api/ids", {
            json: body,
            headers: {
              accept: "application/json",
            },
          })

          expect(createSnapshot({ body }, response)).toMatchSnapshot()
        })
      })
    })
  })

  describe("multiple", () => {
    beforeEach(async () => {
      await insertRelations([{ anidb: 42 }])
    })

    methods.forEach((method) => {
      describe(method.toUpperCase(), () => {
        test("returns 200 with null if not found", async () => {
          const body = [
            {
              [Source.AniList]: 1338,
            },
            {
              [Source.AniDB]: 42,
            },
          ]

          const response = await client[method]("api/ids", {
            json: body,
            headers: {
              accept: "application/json",
            },
          })

          expect(createSnapshot({ body }, response)).toMatchSnapshot()
        })

        test("returns 200 with relation if found", async () => {
          const body = [
            {
              [Source.AniList]: 1337,
            },
            {
              [Source.AniDB]: 42,
            },
          ]

          const response = await client[method]("api/ids", {
            json: body,
            headers: {
              accept: "application/json",
            },
          })

          expect(createSnapshot({ body }, response)).toMatchSnapshot()
        })
      })
    })
  })
})
