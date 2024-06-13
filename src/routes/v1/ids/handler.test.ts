import type { IncomingMessage, ServerResponse } from "node:http"

import type { FastifyInstance } from "fastify"
import type { RawServerDefault } from "fastify/types/utils"
import type { Logger } from "pino"
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"

import { buildApp } from "@/app"
import type { Relation } from "@/db"
import { knex, Source } from "@/db"

let id = 0
const createRelations = async <N extends number>(
  amount: N,
): Promise<N extends 1 ? Relation : Relation[]> => {
  const relations = Array.from({ length: amount }).map(() => ({
    anilist: id++,
    anidb: id++,
    kitsu: id++,
    myanimelist: id++,
  }))

  await knex.insert(relations).into("relations")

  if (amount === 1) {
    return relations[0] as never
  }

  return relations as never
}

let app: FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  Logger
>
beforeAll(async () => {
  app = await buildApp()
})

afterEach(() => knex.delete().from("relations"))

afterAll(async () => {
  await Promise.all([app.close(), knex.destroy()])
})

describe("query params", () => {
  it("fetches relation correctly", async () => {
    const relation = await createRelations(1)

    const response = await app.inject().get("/api/ids").query({
      source: Source.AniList,
      id: relation.anilist!.toString(),
    })

    expect(response.json()).toStrictEqual(relation)
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })

  it("returns null when id doesn't exist", async () => {
    const response = await app.inject().get("/api/ids").query({
      source: Source.Kitsu,
      id: "404" as never,
    })

    expect(response.json()).toBe(null)
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })

  it("can return a partial response", async () => {
    const relation: Relation = {
      anidb: 1337,
      anilist: 1337,
      // TODO
      myanimelist: null!,
      kitsu: null!,
    }
    await knex.insert(relation).into("relations")

    const response = await app.inject().get("/api/ids").query({
      source: Source.AniList,
      id: relation.anilist!.toString(),
    })

    expect(response.json()).toStrictEqual(relation)
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })
})

describe("json body", () => {
  describe("object input", () => {
    it("gET fails with json body", async () => {
      const relations = await createRelations(4)

      const response = await app
        .inject()
        .get("/api/ids")
        .body({
          [Source.AniDB]: relations[0].anidb,
        })

      expect(response.json()).toMatchSnapshot()
      expect(response.statusCode).toBe(400)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    it("fetches a single relation", async () => {
      const relations = await createRelations(4)

      const response = await app
        .inject()
        .post("/api/ids")
        .body({
          [Source.AniDB]: relations[0].anidb,
        })

      expect(response.json()).toStrictEqual(relations[0])
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    it("errors correctly on an empty object", async () => {
      await createRelations(4)

      const response = await app.inject().post("/api/ids").body({})

      expect(response.json()).toMatchSnapshot()
      expect(response.statusCode).toBe(400)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    it("returns null if not found", async () => {
      await createRelations(4)

      const response = await app.inject().post("/api/ids").body({ anidb: 100_000 })

      expect(response.json()).toBe(null)
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    it("can return a partial response", async () => {
      const relation: Relation = {
        anidb: 1337,
        anilist: 1337,
        myanimelist: null as never,
        kitsu: null as never,
      }
      await knex.insert(relation).into("relations")

      const response = await app.inject().post("/api/ids").body({
        anilist: 1337,
      })

      expect(response.json()).toStrictEqual(relation)
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })
  })

  describe("array input", () => {
    it("fetches relations correctly", async () => {
      const relations = await createRelations(4)

      const body = [
        { [Source.AniDB]: relations[0].anidb },
        { [Source.AniList]: 1000 },
        { [Source.Kitsu]: relations[2].kitsu },
      ]

      const result = [relations[0], null, relations[2]]

      const response = await app.inject().post("/api/ids").body(body)

      expect(response.json()).toStrictEqual(result)
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    it("responds correctly on no finds", async () => {
      const body = [{ [Source.AniList]: 1000 }, { [Source.Kitsu]: 1000 }]

      const result = [null, null]

      const response = await app.inject().post("/api/ids").body(body)

      expect(response.json()).toStrictEqual(result)
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    it("requires at least one source", async () => {
      const body = [{}]

      const response = await app.inject().post("/api/ids").body(body)

      expect(response.json()).toMatchSnapshot()
      expect(response.statusCode).toBe(400)
      expect(response.headers["content-type"]).toContain("application/json")
    })
  })
})
