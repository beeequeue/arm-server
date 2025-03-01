import { sValidator } from "@hono/standard-validator"
import { Hono } from "hono"
import type { InferOutput } from "valibot"

import { knex, type OldRelation, type Relation, type Source } from "../../../db.ts"
import { cacheReply, CacheTimes, validationHook } from "../../../utils.ts"

import { bodyInputSchema } from "./schemas/json-body.ts"
import { queryInputSchema } from "./schemas/query-params.ts"

export const v1Routes = new Hono()
	.get("/ids", sValidator("query", queryInputSchema, validationHook), async (c) => {
		const query = c.req.query()

		const row = (await knex
			.select(["anidb", "anilist", "myanimelist", "kitsu"])
			.where({ [query.source]: query.id })
			.from("relations")
			.first()) as Relation | undefined

		cacheReply(c.res, CacheTimes.SIX_HOURS)

		return c.json((row as OldRelation) ?? null)
	})
	.post("/ids", sValidator("json", bodyInputSchema, validationHook), async (c) => {
		const input = await c.req.json<InferOutput<typeof bodyInputSchema>>()

		if (!Array.isArray(input)) {
			const relation = (await knex
				.select(["anidb", "anilist", "myanimelist", "kitsu"])
				.where(input)
				.from("relations")
				.first()) as Relation | undefined

			return c.json(relation ?? null)
		}

		let relations: Array<Relation | null> = []

		// Get relations
		relations = await knex
			.select(["anidb", "anilist", "myanimelist", "kitsu"])
			.where(function () {
				for (const item of input) this.orWhere(item)
			})
			.from("relations")

		// Map them against the input, so we get results like [{item}, null, {item}]
		relations = input.map((item) => {
			const realItem = Object.entries(item)[0] as [Source, number]

			return relations.find((relation) => relation![realItem[0]] === realItem[1]) ?? null
		})

		return c.json(relations)
	})
