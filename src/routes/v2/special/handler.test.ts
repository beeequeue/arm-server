import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../../../app.ts"
import { db, type Relation, Source } from "../../../db/db.ts"
import { testIncludeQueryParam } from "../include.test-utils.ts"

let id = 1
const createRelations = async <N extends number>(
	amount: N,
	specialId?: number,
): Promise<N extends 1 ? Relation : Relation[]> => {
	const relations = Array.from({ length: amount }).map<Relation>(() => ({
		anidb: id++,
		anilist: id++,
		"anime-planet": `${id++}`,
		anisearch: id++,
		imdb: `tt${specialId ?? id++}`,
		kitsu: id++,
		livechart: id++,
		themoviedb: specialId ?? id++,
		thetvdb: specialId ?? id++,
		myanimelist: id++,
	}))

	await db.insertInto("relations").values(relations).execute()

	if (amount === 1) {
		return relations[0] as never
	}

	return relations as never
}

const app = createApp()

beforeEach(async () => {
	await db.deleteFrom("relations").execute()
})

afterAll(async () => {
	await db.destroy()
})

describe("imdb", () => {
	it("fetches relations correctly", async () => {
		await createRelations(4, 1336)
		const relations = await createRelations(3, 1337)

		const response = await app.request(`/api/v2/imdb?id=${relations[0].imdb!}`)

		await expect(response.json()).resolves.toStrictEqual(relations)
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("returns empty array when id doesn't exist", async () => {
		const response = await app.request("/api/v2/imdb?id=tt404")

		await expect(response.json()).resolves.toStrictEqual([])
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("can return a partial response", async () => {
		const relation: Relation = {
			anidb: 1337,
			anilist: 1337,
			"anime-planet": null!,
			anisearch: null!,
			imdb: "tt1337",
			kitsu: null!,
			livechart: null!,
			themoviedb: null!,
			thetvdb: null!,
			myanimelist: null!,
		}
		await db.insertInto("relations").values(relation).execute()

		const response = await app.request(`/api/v2/imdb?id=${relation.imdb!}`)

		await expect(response.json()).resolves.toStrictEqual([relation])
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	testIncludeQueryParam(app, "/api/v2/imdb", Source.IMDB)
})

describe("thetvdb", () => {
	it("fetches relations correctly", async () => {
		await createRelations(4, 1336)
		const relations = await createRelations(3, 1337)

		const response = await app.request(`/api/v2/thetvdb?id=${relations[0].thetvdb!.toString()}`)

		await expect(response.json()).resolves.toStrictEqual(relations)
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("returns empty array when id doesn't exist", async () => {
		const response = await app.request("/api/v2/thetvdb?id=404")

		await expect(response.json()).resolves.toStrictEqual([])
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
			themoviedb: null!,
			thetvdb: 1337,
			myanimelist: null!,
		}
		await db.insertInto("relations").values(relation).execute()

		const response = await app.request(`/api/v2/thetvdb?id=${relation.thetvdb!.toString()}`)

		await expect(response.json()).resolves.toStrictEqual([relation])
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	testIncludeQueryParam(app, "/api/v2/thetvdb", Source.TheTVDB)
})

describe("themoviedb", () => {
	it("fetches relations correctly", async () => {
		await createRelations(4, 1336)
		const relations = await createRelations(3, 1337)

		const response = await app.request(
			`/api/v2/themoviedb?id=${relations[0].themoviedb!.toString()}`,
		)

		await expect(response.json()).resolves.toStrictEqual(relations)
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("returns empty array when id doesn't exist", async () => {
		const response = await app.request(`/api/v2/themoviedb?id=${(404).toString()}`)

		await expect(response.json()).resolves.toStrictEqual([])
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
			themoviedb: 1337,
			thetvdb: null!,
			myanimelist: null!,
		}
		await db.insertInto("relations").values(relation).execute()

		const response = await app.request(`/api/v2/themoviedb?id=${relation.themoviedb!.toString()}`)

		await expect(response.json()).resolves.toStrictEqual([relation])
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	testIncludeQueryParam(app, "/api/v2/themoviedb", Source.TheMovieDB)
})
