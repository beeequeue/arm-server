import { sValidator } from "@hono/standard-validator"
import { Hono } from "hono"
import type { InferOutput } from "valibot"

import { db } from "../../../db.ts"
import type { OldRelation, Relation, SourceValue } from "../../../db.ts"
import { cacheReply, CacheTimes, validationHook } from "../../../utils.ts"

import { bodyInputSchema } from "./schemas/json-body.ts"
import { queryInputSchema } from "./schemas/query-params.ts"

// Fields to select for v1 API
const V1_FIELDS = [
	"relations.anidb",
	"relations.anilist",
	"relations.myanimelist",
	"relations.kitsu",
] as const

export const v1Routes = new Hono()
	.get("/ids", sValidator("query", queryInputSchema, validationHook), async (c) => {
		const query = c.req.query()

		const row = await db
			.selectFrom("relations")
			.select(V1_FIELDS)
			.where(query.source as keyof Relation, "=", query.id)
			.executeTakeFirst()

		cacheReply(c.res, CacheTimes.SIX_HOURS)

		return c.json((row as OldRelation) ?? null)
	})
	.post("/ids", sValidator("json", bodyInputSchema, validationHook), async (c) => {
		const input = await c.req.json<InferOutput<typeof bodyInputSchema>>()

		if (!Array.isArray(input)) {
			// Single item query
			const [key, value] = Object.entries(input)[0]

			const relation = await db
				.selectFrom("relations")
				.select(V1_FIELDS)
				.where(key as keyof Relation, "=", value)
				.executeTakeFirst()

			return c.json(relation ?? null)
		}

		let relations: Array<Relation | null> = []

		// Get relations with multiple OR conditions
		if (input.length > 0) {
			let query = db.selectFrom("relations").select(V1_FIELDS)

			// Build OR conditions
			query = query.where((eb) =>
				eb.or(
					input.map((item) => {
						const [key, value] = Object.entries(item)[0]
						return eb(key as keyof Relation, "=", value)
					}),
				),
			)

			relations = await query.execute()
		}

		// Map them against the input, so we get results like [{item}, null, {item}]
		relations = input.map((item) => {
			const realItem = Object.entries(item)[0] as [SourceValue, number]

			return relations.find((relation) => relation![realItem[0]] === realItem[1]) ?? null
		})

		return c.json(relations)
	})
