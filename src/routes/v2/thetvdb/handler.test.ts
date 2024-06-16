import { testClient } from "hono/testing"
import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../../../app.js"
import { type Relation, knex } from "../../../db.js"
import { testIncludeQueryParam } from "../include.test-utils.js"

let id = 1
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

const app = createApp()

beforeEach(async () => {
	await knex.delete().from("relations")
})

afterAll(async () => {
	await knex.destroy()
})

describe("query params", () => {
	it("fetches relations correctly", async () => {
		await createRelations(4, 1336)
		const relations = await createRelations(3, 1337)

		const response = await testClient(app).api.v2.thetvdb.$get({
			query: {
				id: relations[0].thetvdb!.toString(),
			},
		})

		await expect(response.json()).resolves.toStrictEqual(relations)
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("returns empty array when id doesn't exist", async () => {
		const response = await testClient(app).api.v2.thetvdb.$get({
			query: {
				id: (404).toString(),
			},
		})

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
			"notify-moe": null!,
			themoviedb: null!,
			thetvdb: 1337,
			myanimelist: null!,
		}
		await knex.insert(relation).into("relations")

		const response = await testClient(app).api.v2.thetvdb.$get({
			query: {
				id: relation.thetvdb!.toString(),
			},
		})

		await expect(response.json()).resolves.toStrictEqual([relation])
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})
})

testIncludeQueryParam(app, "/api/v2/thetvdb", true)
