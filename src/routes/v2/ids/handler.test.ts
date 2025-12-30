import { afterAll, afterEach, describe, expect, it } from "vitest"

import { createApp } from "../../../app.ts"
import { db, type Relation, Source } from "../../../db/db.ts"
import { testIncludeQueryParam } from "../include.test-utils.ts"

let id = 1
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

	// Insert each relation
	for (const relation of relations) {
		await db.insertInto("relations").values(relation).execute()
	}

	if (amount === 1) {
		return relations[0] as never
	}

	return relations as never
}

const app = createApp()

afterEach(async () => {
	await db.deleteFrom("relations").execute()
})

afterAll(async () => {
	await db.destroy()
})

describe("query params", () => {
	it("fetches relation correctly", async () => {
		const relation = await createRelations(1)

		const params = new URLSearchParams({
			source: Source.AniList,
			id: relation.anilist!.toString(),
		})
		const response = await app.request(`/api/v2/ids?${params.toString()}`)

		expect(await response.json()).toStrictEqual(relation)
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("returns null when id doesn't exist", async () => {
		const params = new URLSearchParams({
			source: Source.Kitsu,
			id: "404" as never,
		})
		const response = await app.request(`/api/v2/ids?${params.toString()}`)

		expect(await response.json()).toStrictEqual(null)
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
		await db.insertInto("relations").values(relation).execute()

		const params = new URLSearchParams({
			source: Source.AniList,
			id: relation.anilist!.toString(),
		})
		const response = await app.request(`/api/v2/ids?${params.toString()}`)

		expect(await response.json()).toStrictEqual(relation)
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})
})

describe("json body", () => {
	describe("object input", () => {
		it.skip("gET fails with json body", async () => {
			const relations = await createRelations(4)

			const response = await app.request("/api/v2/ids", {
				body: JSON.stringify({
					[Source.AniDB]: relations[0].anidb,
				}),
			})

			await expect(response.json()).resolves.toMatchSnapshot()
			expect(response.status).toBe(400)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("fetches a single relation", async () => {
			const relations = await createRelations(4)

			const response = await app.request("/api/v2/ids", {
				method: "POST",
				body: JSON.stringify({
					[Source.AniDB]: relations[0].anidb,
				}),
			})

			await expect(response.json()).resolves.toStrictEqual(relations[0])
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("errors correctly on an empty object", async () => {
			await createRelations(4)

			const response = await app.request("/api/v2/ids", {
				method: "POST",
				body: JSON.stringify({}),
			})

			await expect(response.json()).resolves.toMatchSnapshot()
			expect(response.status).toBe(400)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("returns null if not found", async () => {
			await createRelations(4)

			const response = await app.request("/api/v2/ids", {
				method: "POST",
				body: JSON.stringify({ anidb: 100_000 }),
			})

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
			await db.insertInto("relations").values(relation).execute()

			const response = await app.request("/api/v2/ids", {
				method: "POST",
				body: JSON.stringify({ anilist: 1337 }),
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

			const response = await app.request("/api/v2/ids", {
				method: "POST",
				body: JSON.stringify(body),
			})

			await expect(response.json()).resolves.toStrictEqual(result)
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("responds correctly on no finds", async () => {
			const body = [{ [Source.AniList]: 1000 }, { [Source.Kitsu]: 1000 }]

			const result = [null, null]

			const response = await app.request("/api/v2/ids", {
				method: "POST",
				body: JSON.stringify(body),
			})

			await expect(response.json()).resolves.toStrictEqual(result)
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("requires at least one source", async () => {
			const body = [{}]

			const response = await app.request("/api/v2/ids", {
				method: "POST",
				body: JSON.stringify(body),
			})

			await expect(response.json()).resolves.toMatchSnapshot()
			expect(response.status).toBe(400)
			expect(response.headers.get("content-type")).toContain("application/json")
		})
	})
})

testIncludeQueryParam(app, "/api/v2/ids")
