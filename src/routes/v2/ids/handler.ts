import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

import { knex, type Relation, type Source } from "../../../db.ts"
import { cacheReply, CacheTimes, zHook } from "../../../utils.ts"
import { buildSelectFromInclude, includeSchema } from "../include.ts"

import { bodyInputSchema } from "./schemas/json-body.ts"
import { queryInputSchema } from "./schemas/query-params.ts"

export const v2Routes = new Hono()
	.get("/ids", zValidator("query", queryInputSchema, zHook), async (c) => {
		const query = c.req.query()
		const data = (await knex
			.select(buildSelectFromInclude(query.include))
			.where({ [query.source]: query.id })
			.from("relations")
			.first()) as Relation | undefined

		cacheReply(c.res, CacheTimes.SIX_HOURS)

		return c.json((data as Relation | null) ?? null)
	})
	.post(
		"/ids",
		zValidator("json", bodyInputSchema, zHook),
		zValidator("query", includeSchema, zHook),
		async (c) => {
			const input = await c.req.json<typeof bodyInputSchema._type>()
			const query = c.req.query()

			const select = buildSelectFromInclude(query.include)

			if (!Array.isArray(input)) {
				const relation = (await knex
					.select(select)
					.where(input)
					.from("relations")
					.first()) as Relation | undefined

				return c.json(relation ?? null)
			}

			let relations: Array<Relation | null> = []

			// Get relations
			relations = await knex
				.select(select)
				.where(function () {
					for (const item of input) void this.orWhere(item)
				})
				.from("relations")

			// Map them against the input, so we get results like [{item}, null, {item}]
			relations = input.map((item) => {
				const realItem = Object.entries(item)[0] as [Source, number]

				return (
					relations.find((relation) => relation![realItem[0]] === realItem[1]) ?? null
				)
			})

			return c.json(relations)
		},
	)
