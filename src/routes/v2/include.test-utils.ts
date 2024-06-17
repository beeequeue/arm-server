import { describe, expect, test } from "vitest"

import type { Hono } from "hono"
import { Source, knex } from "../../db.js"

export const testIncludeQueryParam = (
	app: Hono,
	path: string,
	source = Source.AniList,
) => {
	const arrayify = <T>(data: T) => (source !== Source.AniList ? [data] : data)

	describe("?include", () => {
		test("single source (anilist)", async () => {
			await knex
				.insert({ anilist: 1337, thetvdb: 1337, themoviedb: 1337 })
				.into("relations")

			const query = new URLSearchParams({
				source,
				id: (1337).toString(),
				include: source,
			})
			const response = await app.fetch(
				new Request(`http://localhost${path}?${query.toString()}`),
			)

			await expect(response.json()).resolves.toStrictEqual(arrayify({ [source]: 1337 }))
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		test("multiple sources (anilist,thetvdb,themoviedb)", async () => {
			await knex
				.insert({ anilist: 1337, thetvdb: 1337, themoviedb: 1337 })
				.into("relations")

			const query = new URLSearchParams({
				source,
				id: (1337).toString(),
				include: [Source.AniList, Source.TheTVDB, Source.TheMovieDB].join(","),
			})
			const response = await app.fetch(
				new Request(`http://localhost${path}?${query.toString()}`),
			)

			await expect(response.json()).resolves.toStrictEqual(
				arrayify({ anilist: 1337, thetvdb: 1337, themoviedb: 1337 }),
			)
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		test("all the sources", async () => {
			await knex
				.insert({ anilist: 1337, [source]: 1337 })
				.into("relations")

			const query = new URLSearchParams({
				source,
				id: (1337).toString(),
				include: Object.values(Source).join(","),
			})
			const response = await app.fetch(
				new Request(`http://localhost${path}?${query.toString()}`),
			)

      const expectedResult: Record<Source, number | null> = {
        anidb: null,
        anilist: 1337,
        "anime-planet": null,
        anisearch: null,
        imdb: null,
        kitsu: null,
        livechart: null,
        "notify-moe": null,
        themoviedb: null,
        thetvdb: null,
        myanimelist: null,
      }
      expectedResult[source] = 1337
			await expect(response.json()).resolves.toStrictEqual(
				arrayify(expectedResult),
			)
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})
	})
}
