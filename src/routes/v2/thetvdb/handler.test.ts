import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { buildApp } from "@/app"
import type { Relation } from "@/db"
import { knex, Source } from "@/db"
import { testIncludeQueryParam } from "../include.test-utils"

let id = 0
const createRelations = async <N extends number>(
  amount: N,
  thetvdbId?: number,
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
    thetvdb: thetvdbId ?? id++,
    myanimelist: id++,
  }))

  await knex.insert(relations).into("relations")

  if (amount === 1) {
    return relations[0] as never
  }

  return relations as never
}

const PATH = "/api/v2/thetvdb"
const app = await buildApp()

beforeEach(async () => {
  await knex.delete().from("relations")
})

afterAll(async () => {
  await Promise.all([app.close(), knex.destroy()])
})

describe("query params", () => {
  it("fetches relations correctly", async () => {
    await createRelations(4, 1336)
    const relations = await createRelations(3, 1337)

    const response = await app.inject().get(PATH).query({
      source: Source.TheTVDB,
      id: relations[0].thetvdb!.toString(),
    })

    expect(response.json()).toStrictEqual(relations)
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })

  it("returns empty array when id doesn't exist", async () => {
    const response = await app.inject().get(PATH).query({
      source: Source.TheTVDB,
      id: (404).toString(),
    })

    expect(response.json()).toStrictEqual([])
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
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
      thetvdb: 1337,
      myanimelist: null!,
    }
    await knex.insert(relation).into("relations")

    const response = await app.inject().get(PATH).query({
      source: Source.TheTVDB,
      id: relation.thetvdb!.toString(),
    })

    expect(response.json()).toStrictEqual([relation])
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })
})

testIncludeQueryParam(app, PATH, true)
