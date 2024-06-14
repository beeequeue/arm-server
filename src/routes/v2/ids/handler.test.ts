import { afterAll, afterEach, describe, expect, it } from "vitest"

import { testIncludeQueryParam } from "../include.test-utils"
import { buildApp } from "@/app"
import { type Relation, Source, knex } from "@/db"

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

const PATH = "/api/v2/ids"
const app = await buildApp()

afterEach(() => knex.delete().from("relations"))

afterAll(async () => {
  await Promise.all([app.close(), knex.destroy()])
})

describe("query params", () => {
  it("fetches relation correctly", async () => {
    const relation = await createRelations(1)

    const response = await app.inject().get(PATH).query({
      source: Source.AniList,
      id: relation.anilist!.toString(),
    })

    await expect(response.json()).resolves.toStrictEqual(relation)
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("application/json")
  })

  it("returns null when id doesn't exist", async () => {
    const response = await app.inject().get(PATH).query({
      source: Source.Kitsu,
      id: "404" as never,
    })

    expect(response.json()).toBe(null)
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("application/json")
  })

  it("can return a partial response", async () => {
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

    const response = await app.inject().get(PATH).query({
      source: Source.AniList,
      id: relation.anilist!.toString(),
    })

    await expect(response.json()).resolves.toStrictEqual(relation)
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("application/json")
  })
})

describe("json body", () => {
  describe("object input", () => {
    it("gET fails with json body", async () => {
      const relations = await createRelations(4)

      const response = await app
        .inject()
        .get(PATH)
        .body({
          [Source.AniDB]: relations[0].anidb,
        })

      await expect(response.json()).resolves.toMatchSnapshot()
      expect(response.status).toBe(400)
      expect(response.headers.get("content-type")).toContain("application/json")
    })

    it("fetches a single relation", async () => {
      const relations = await createRelations(4)

      const response = await app
        .inject()
        .post(PATH)
        .body({
          [Source.AniDB]: relations[0].anidb,
        })

      await expect(response.json()).resolves.toStrictEqual(relations[0])
      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("application/json")
    })

    it("errors correctly on an empty object", async () => {
      await createRelations(4)

      const response = await app.inject().post(PATH).body({})

      await expect(response.json()).resolves.toMatchSnapshot()
      expect(response.status).toBe(400)
      expect(response.headers.get("content-type")).toContain("application/json")
    })

    it("returns null if not found", async () => {
      await createRelations(4)

      const response = await app.inject().post(PATH).body({ anidb: 100_000 })

      await expect(response.json()).resolves.toBe(null)
      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("application/json")
    })

    it("can return a partial response", async () => {
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

      const response = await app.inject().post(PATH).body({
        anilist: 1337,
      })

      await expect(response.json()).resolves.toStrictEqual(relation)
      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("application/json")
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

      const response = await app.inject().post(PATH).body(body)

      await expect(response.json()).resolves.toStrictEqual(result)
      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("application/json")
    })

    it("responds correctly on no finds", async () => {
      const body = [{ [Source.AniList]: 1000 }, { [Source.Kitsu]: 1000 }]

      const result = [null, null]

      const response = await app.inject().post(PATH).body(body)

      await expect(response.json()).resolves.toStrictEqual(result)
      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("application/json")
    })

    it("requires at least one source", async () => {
      const body = [{}]

      const response = await app.inject().post(PATH).body(body)

      await expect(response.json()).resolves.toMatchSnapshot()
      expect(response.status).toBe(400)
      expect(response.headers.get("content-type")).toContain("application/json")
    })
  })
})

testIncludeQueryParam(app, PATH)
