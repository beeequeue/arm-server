/* eslint-disable import/no-extraneous-dependencies */

import { FastifyInstance } from "fastify"
import { describe, expect, test } from "vitest"

import { knex, Source } from "@/db"

export const testIncludeQueryParam = (
  app: FastifyInstance,
  path: string,
  thetvdb = false,
) => {
  const source = thetvdb ? Source.TheTVDB : Source.AniList
  const arrayify = <T>(data: T) => (thetvdb ? [data] : data)

  describe("?include", () => {
    test("single source (anilist)", async () => {
      await knex.insert({ thetvdb: 1337, anilist: 1337 }).into("relations")

      const response = await app.inject().get(path).query({
        source,
        id: (1337).toString(),
        include: source,
      })

      expect(response.json()).toStrictEqual(arrayify({ [source]: 1337 }))
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    test("multiple sources (anilist,thetvdb)", async () => {
      await knex.insert({ thetvdb: 1337, anilist: 1337 }).into("relations")

      const response = await app
        .inject()
        .get(path)
        .query({
          source,
          id: (1337).toString(),
          include: [Source.AniList, Source.TheTVDB].join(","),
        })

      expect(response.json()).toStrictEqual(arrayify({ thetvdb: 1337, anilist: 1337 }))
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })

    test("all the sources", async () => {
      await knex.insert({ thetvdb: 1337, anilist: 1337 }).into("relations")

      const response = await app
        .inject()
        .get(path)
        .query({
          source,
          id: (1337).toString(),
          include: Object.values(Source).join(","),
        })

      expect(response.json()).toStrictEqual(
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
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toContain("application/json")
    })
  })
}
