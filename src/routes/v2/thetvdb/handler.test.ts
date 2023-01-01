import { FastifyInstance } from "fastify"
import { afterAll, afterEach, beforeAll, describe, test, expect } from "vitest"

import { buildApp } from "@/app"
import { knex, Relation, Source } from "@/db"

let id = 0
const createRelations = async <N extends number>(
  amount: N,
): Promise<N extends 1 ? Relation : Relation[]> => {
  const relations = Array.from({ length: amount }).map<Relation>(() => ({
    anidb: id++,
    anilist: id++,
    "anime-planet": `${id++}`,
    anisearch: id++,
    imdb: `tt${id++}`,
    kitsu: id++,
    livechart: id++,
    "notify-moe": `${id++}`,
    themoviedb: id++,
    thetvdb: id++,
    myanimelist: id++,
  }))

  await knex.insert(relations).into("relations")

  if (amount === 1) {
    return relations[0] as never
  }

  return relations as never
}

let app: FastifyInstance
beforeAll(async () => {
  app = await buildApp()
})

afterAll(async () => {
  await Promise.all([app.close(), knex.destroy()])
})

afterEach(() => knex.delete().from("relations"))

describe("query params", () => {
  test("fetches relation correctly", async () => {
    const relation = await createRelations(1)

    const response = await app.inject().get("/api/v2/ids").query({
      source: Source.AniList,
      id: relation.anilist!.toString(),
    })

    expect(response.json()).toStrictEqual(relation)
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })

  test("returns null when id doesn't exist", async () => {
    const response = await app.inject().get("/api/v2/ids").query({
      source: Source.Kitsu,
      id: 404!.toString(),
    })

    expect(response.json()).toBe(null)
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })

  test("can return a partial response", async () => {
    const relation: Relation = {
      anidb: 1337,
      anilist: 1337,
      "anime-planet": null!,
      anisearch: null!,
      imdb: null!,
      kitsu: null!,
      livechart: null!,
      "notify-moe": null!,
      themoviedb: null!,
      thetvdb: null!,
      myanimelist: null!,
    }
    await knex.insert(relation).into("relations")

    const response = await app.inject().get("/api/v2/ids").query({
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
    test("GET fails with json body", async () => {
      const relations = await createRelations(4)

      const response = await app
        .inject()
        .get("/api/v2/ids")
        .body({
          [Source.AniDB]: relations[0].anidb,
        })

      expect(response.json()).toMatchSnapshot()
      expect(response.statusCode).toBe(400)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    test("fetches a single relation", async () => {
      const relations = await createRelations(4)

      const response = await app
        .inject()
        .post("/api/v2/ids")
        .body({
          [Source.AniDB]: relations[0].anidb,
        })

      expect(response.json()).toStrictEqual(relations[0])
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    test("errors correctly on an empty object", async () => {
      await createRelations(4)

      const response = await app.inject().post("/api/v2/ids").body({})

      expect(response.json()).toMatchSnapshot()
      expect(response.statusCode).toBe(400)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    test("returns null if not found", async () => {
      await createRelations(4)

      const response = await app.inject().post("/api/v2/ids").body({ anidb: 100_000 })

      expect(response.json()).toBe(null)
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    test("can return a partial response", async () => {
      const relation: Relation = {
        anidb: 1337,
        anilist: 1337,
        "anime-planet": null!,
        anisearch: null!,
        imdb: null!,
        kitsu: null!,
        livechart: null!,
        "notify-moe": null!,
        themoviedb: null!,
        thetvdb: null!,
        myanimelist: null!,
      }
      await knex.insert(relation).into("relations")

      const response = await app.inject().post("/api/v2/ids").body({
        anilist: 1337,
      })

      expect(response.json()).toStrictEqual(relation)
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })
  })

  describe("array input", () => {
    test("fetches relations correctly", async () => {
      const relations = await createRelations(4)

      const body = [
        { [Source.AniDB]: relations[0].anidb },
        { [Source.AniList]: 1000 },
        { [Source.Kitsu]: relations[2].kitsu },
      ]

      const result = [relations[0], null, relations[2]]

      const response = await app.inject().post("/api/v2/ids").body(body)

      expect(response.json()).toStrictEqual(result)
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    test("responds correctly on no finds", async () => {
      const body = [{ [Source.AniList]: 1000 }, { [Source.Kitsu]: 1000 }]

      const result = [null, null]

      const response = await app.inject().post("/api/v2/ids").body(body)

      expect(response.json()).toStrictEqual(result)
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    test("requires at least one source", async () => {
      const body = [{}]

      const response = await app.inject().post("/api/v2/ids").body(body)

      expect(response.json()).toMatchSnapshot()
      expect(response.statusCode).toBe(400)
      expect(response.headers["content-type"]).toContain("application/json")
    })
  })
})
