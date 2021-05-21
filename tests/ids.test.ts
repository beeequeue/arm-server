import type { Server } from "http"
import { URLSearchParams } from "url"

import HttpClient, { Got, Response } from "got"
import listen from "test-listen"
import type { JsonValue } from "type-fest"
import { createServer } from "vercel-node-server"

import { Relation, Source } from "../api/_types"
import IdFunction from "../api/ids"

import { cleanUpDb, insertRelations } from "./utils"

const createSnapshot = (
  input: { json?: unknown; searchParams?: URLSearchParams },
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
    throwHttpErrors: false,
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
          const json = {
            [Source.AniList]: 1338,
          }

          const response = await client[method]("api/ids", {
            json,
            headers: {
              accept: "application/json",
            },
          })

          expect(createSnapshot({ json }, response)).toMatchSnapshot()
        })

        test("returns 200 with relation if found", async () => {
          const json = {
            [Source.AniList]: 1337,
          }

          const response = await client[method]("api/ids", {
            json,
            headers: {
              accept: "application/json",
            },
          })

          expect(createSnapshot({ json }, response)).toMatchSnapshot()
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
          const json = [
            {
              [Source.AniList]: 1338,
            },
            {
              [Source.AniDB]: 42,
            },
          ]

          const response = await client[method]("api/ids", {
            json,
            headers: {
              accept: "application/json",
            },
          })

          expect(createSnapshot({ json }, response)).toMatchSnapshot()
        })

        test("returns 200 with relation if found", async () => {
          const json = [
            {
              [Source.AniList]: 1337,
            },
            {
              [Source.AniDB]: 42,
            },
          ]

          const response = await client[method]("api/ids", {
            json,
            headers: {
              accept: "application/json",
            },
          })

          expect(createSnapshot({ json }, response)).toMatchSnapshot()
        })
      })
    })
  })
})

describe("input errors", () => {
  const inputs: Array<["searchParams" | "json", JsonValue]> = [
    ["searchParams", { source: "aniList", id: 1337 }],
    ["searchParams", { source: "anilist", id: -1 }],
    ["searchParams", { source: "anilist" }],
    ["searchParams", { id: 1337 }],
    ["json", {}],
    ["json", { aniList: 1337 }],
    ["json", { anilist: -1 }],
    ["json", { anilist: 1.5 }],
    ["json", []],
    ["json", [{}]],
    ["json", [{ aniList: 1337 }]],
    ["json", [{ anilist: -1 }]],
  ]

  test.each(inputs)("%s %p", async (inputType, input) => {
    const formattedInput = inputType === "searchParams" ? new URLSearchParams(input) : input

    const response = await client("api/ids", {
      [inputType]: formattedInput,
      headers: {
        accept: "application/json",
      },
    })

    expect(createSnapshot({ [inputType]: input }, response)).toMatchSnapshot()
    expect(response.statusCode).toBe(400)
  })
})
