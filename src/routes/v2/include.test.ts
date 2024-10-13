import { zValidator } from "@hono/zod-validator"
import type { Context } from "hono"
import { Hono } from "hono"
import { testClient } from "hono/testing"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"

import { knex, Source } from "../../db.js"

import { includeSchema } from "./include.js"

const handlerFn = vi.fn((c: Context) => c.json({ message: "ok" }))
const app = new Hono().get("/test", zValidator("query", includeSchema), handlerFn)

beforeEach(async () => {
	await knex.delete().from("relations")
})

afterAll(async () => {
	await knex.destroy()
})

describe("schema", () => {
	it("single source (anilist)", async () => {
		const response = await testClient(app).test.$get({
			query: {
				include: Source.AniList,
			},
		})

		await expect(response.json()).resolves.toStrictEqual({ message: "ok" })
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("multiple sources (anilist,thetvdb)", async () => {
		const response = await testClient(app).test.$get({
			query: {
				include: [Source.AniList, Source.TheTVDB].join(","),
			},
		})

		await expect(response.json()).resolves.toStrictEqual({ message: "ok" })
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})

	it("all the sources", async () => {
		const response = await testClient(app).test.$get({
			query: {
				include: Object.values(Source).join(","),
			},
		})

		await expect(response.json()).resolves.toStrictEqual({ message: "ok" })
		expect(response.status).toBe(200)
		expect(response.headers.get("content-type")).toContain("application/json")
	})
})
