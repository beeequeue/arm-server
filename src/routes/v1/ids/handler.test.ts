import { testClient } from "hono/testing"
import { afterAll, afterEach, describe, expect, it } from "vitest"

import { createApp } from "../../../app.ts"
import { db, type Relation, Source } from "../../../db.ts"

let id = 1
const createRelations = async <N extends number>(
	amount: N,
): Promise<N extends 1 ? Relation : Relation[]> => {
	const relations = Array.from({ length: amount }).map(() => ({
		anilist: id++,
		anidb: id++,
		kitsu: id++,
		myanimelist: id++,
	}))

	await db.insertInto("relations").values(relations).execute()

	if (amount === 1) {
		return relations[0] as never
	}

	return relations as never
}

const app = createApp()

afterEach(async () => db.deleteFrom("relations").execute())

afterAll(async () => {
	await db.destroy()
})

describe("query params", () => {
	it("fetches relation correctly", async () => {
		const relation = await createRelations(1)

		const response = await testClient(app).api.ids.$get({
			query: {
				source: Source.AniList,
				id: relation.anilist!.toString(),
			},
		})

		expect(await response.json()).toStrictEqual(relation)
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("returns null when id doesn't exist", async () => {
		const response = await testClient(app).api.ids.$get({
			query: {
				source: Source.Kitsu,
				id: "404",
			},
		})

		await expect(response.json()).resolves.toBe(null)
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("can return a partial response", async () => {
		const relation: Relation = {
			anidb: 1337,
			anilist: 1337,
			// TODO
			myanimelist: null!,
			kitsu: null!,
		}
		await db.insertInto("relations").values(relation).execute()

		const response = await testClient(app).api.ids.$get({
			query: {
				source: Source.AniList,
				id: relation.anilist!.toString(),
			},
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

			const response = await testClient(app).api.ids.$get({
				// @ts-expect-error: We want to make an invalid request
				json: {
					[Source.AniDB]: relations[0].anidb,
				},
			})

			await expect(response.json()).resolves.toMatchSnapshot()
			expect(response.status).toBe(400)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("fetches a single relation", async () => {
			const relations = await createRelations(4)

			const response = await testClient(app).api.ids.$post({
				json: {
					[Source.AniDB]: relations[0].anidb,
				},
			})

			await expect(response.json()).resolves.toStrictEqual(relations[0])
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("errors correctly on an empty object", async () => {
			await createRelations(4)

			const response = await testClient(app).api.ids.$post({
				json: {},
			})

			await expect(response.json()).resolves.toMatchSnapshot()
			expect(response.status).toBe(400)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("returns null if not found", async () => {
			await createRelations(4)

			const response = await testClient(app).api.ids.$post({
				json: { anidb: 100_000 },
			})

			await expect(response.json()).resolves.toBe(null)
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("can return a partial response", async () => {
			const relation: Relation = {
				anidb: 1337,
				anilist: 1337,
				myanimelist: null as never,
				kitsu: null as never,
			}
			await db.insertInto("relations").values(relation).execute()

			const response = await testClient(app).api.ids.$post({
				json: { anilist: 1337 },
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

			const response = await testClient(app).api.ids.$post({
				json: body,
			})

			await expect(response.json()).resolves.toStrictEqual(result)
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("responds correctly on no finds", async () => {
			const body = [{ [Source.AniList]: 1000 }, { [Source.Kitsu]: 1000 }]

			const result = [null, null]

			const response = await testClient(app).api.ids.$post({
				json: body,
			})

			await expect(response.json()).resolves.toStrictEqual(result)
			expect(response.status).toBe(200)
			expect(response.headers.get("content-type")).toContain("application/json")
		})

		it("requires at least one source", async () => {
			const body = [{}]

			const response = await testClient(app).api.ids.$post({
				json: body,
			})

			await expect(response.json()).resolves.toMatchSnapshot()
			expect(response.status).toBe(400)
			expect(response.headers.get("content-type")).toContain("application/json")
		})
	})
})
