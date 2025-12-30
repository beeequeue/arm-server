import { getValidatedQuery, H3, type H3EventContext } from "h3"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"

import { db, Source } from "../../db/db.ts"

import { includeSchema } from "./include.ts"

const handlerFn = vi.fn((_event: H3EventContext) => ({ message: "ok" }))
const app = new H3().get("/test", async (event) => {
	await getValidatedQuery(event, includeSchema)

	return handlerFn(event.context)
})

beforeEach(async () => {
	await db.deleteFrom("relations").execute()
})

afterAll(async () => {
	await db.destroy()
})

describe("schema", () => {
	it("single source (anilist)", async () => {
		const response = await app.request(`/test?include=${Source.AniList}`)

		await expect(response.json()).resolves.toStrictEqual({ message: "ok" })
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("multiple sources (anilist,thetvdb)", async () => {
		const params = new URLSearchParams({
			include: [Source.AniList, Source.TheTVDB].join(","),
		})
		const response = await app.request(`/test?${params.toString()}`)

		await expect(response.json()).resolves.toStrictEqual({ message: "ok" })
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("all the sources", async () => {
		const params = new URLSearchParams({
			include: Object.values(Source).join(","),
		})
		const response = await app.request(`/test?${params.toString()}`)

		await expect(response.json()).resolves.toStrictEqual({ message: "ok" })
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})
})
