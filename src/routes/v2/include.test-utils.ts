import { describe, expect, test } from "vitest"

import type { Hono } from "hono"
import { Source, knex } from "../../db.js"

export const testIncludeQueryParam = (
  app: Hono,
  path: string,
  thetvdb = false,
) => {
  const source = thetvdb ? Source.TheTVDB : Source.AniList
  const arrayify = <T>(data: T) => (thetvdb ? [data] : data)

  describe("?include", () => {
    test("single source (anilist)", async () => {
      await knex.insert({ thetvdb: 1337, anilist: 1337 }).into("relations")

      const query = new URLSearchParams({
        source,
        id: (1337).toString(),
        include: source,
      })
      const response = await app.fetch(new Request(`http://localhost${path}?${query.toString()}`))

      await expect(response.json()).resolves.toStrictEqual(arrayify({ [source]: 1337 }))
      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("application/json")
    })

    test("multiple sources (anilist,thetvdb)", async () => {
      await knex.insert({ thetvdb: 1337, anilist: 1337 }).into("relations")

      const query = new URLSearchParams({
        source,
        id: (1337).toString(),
        include: [Source.AniList, Source.TheTVDB].join(","),
      })
      const response = await app.fetch(new Request(`http://localhost${path}?${query.toString()}`))

      await expect(response.json()).resolves.toStrictEqual(arrayify({ thetvdb: 1337, anilist: 1337 }))
      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("application/json")
    })

    test("all the sources", async () => {
      await knex.insert({ thetvdb: 1337, anilist: 1337 }).into("relations")

      const query = new URLSearchParams({
        source,
        id: (1337).toString(),
        include: Object.values(Source).join(","),
      })
      const response = await app.fetch(new Request(`http://localhost${path}?${query.toString()}`))

      await expect(response.json()).resolves.toStrictEqual(
        arrayify({
          anidb: null,
          anilist: 1337,
          "anime-planet": null,
          anisearch: null,
          imdb: null,
          kitsu: null,
          livechart: null,
          "notify-moe": null,
          themoviedb: null,
          thetvdb: 1337,
          myanimelist: null,
        }),
      )
      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("application/json")
    })
  })
}
