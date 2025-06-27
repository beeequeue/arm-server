import type { Hono } from "hono"
import { describe, expect, test } from "vitest"

import { db, Source, type SourceValue } from "../../db.ts"

export const testIncludeQueryParam = (
	app: Hono,
	path: string,
	source: SourceValue = Source.AniList,
) => {
	const arrayify = <T>(data: T) => (source !== Source.AniList ? [data] : data)
	const prefixify = <S extends SourceValue, T extends string | number>(
		source: S,
		input: T,
	) => (source === "imdb" ? (`tt${input}` as const) : input)

	describe("?include", () => {
		test("single source", async () => {
			await db
				.insertInto("relations")
				.values({ anilist: 1337, thetvdb: 1337, themoviedb: 1337, imdb: "tt1337" })
				.execute()

			const query = new URLSearchParams({
				source,
				id: prefixify(source, "1337"),
				include: source,
			})
			const response = await app.fetch(
				new Request(`http://localhost${path}?${query.toString()}`),
			)

			await expect(response.json()).resolves.toStrictEqual(
				arrayify({ [source]: prefixify(source, 1337) }),
			)
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		test("multiple sources (anilist,thetvdb,themoviedb)", async () => {
			await db
				.insertInto("relations")
				.values({ anilist: 1337, thetvdb: 1337, themoviedb: 1337, imdb: "tt1337" })
				.execute()

			const query = new URLSearchParams({
				source,
				id: prefixify(source, "1337"),
				include: [Source.AniList, Source.TheTVDB, Source.TheMovieDB, Source.IMDB].join(
					",",
				),
			})
			const response = await app.fetch(
				new Request(`http://localhost${path}?${query.toString()}`),
			)

			await expect(response.json()).resolves.toStrictEqual(
				arrayify({ anilist: 1337, thetvdb: 1337, themoviedb: 1337, imdb: "tt1337" }),
			)
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		test("all the sources", async () => {
			await db
				.insertInto("relations")
				.values({ anilist: 1337, [source]: prefixify(source, 1337) })
				.execute()

			const query = new URLSearchParams({
				source,
				id: prefixify(source, "1337"),
				include: Object.values(Source).join(","),
			})
			const response = await app.fetch(
				new Request(`http://localhost${path}?${query.toString()}`),
			)

			const expectedResult: Record<SourceValue, number | null> = {
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
			expectedResult[source] = prefixify(source, 1337) as never

			await expect(response.json()).resolves.toStrictEqual(arrayify(expectedResult))
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})
	})
}
