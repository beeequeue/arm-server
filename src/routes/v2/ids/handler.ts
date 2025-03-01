import { sValidator } from "@hono/standard-validator"
import { Hono } from "hono"
import type { InferOutput } from "valibot"

import { knex, type Relation, type Source } from "../../../db.ts"
import { cacheReply, CacheTimes, validationHook } from "../../../utils.ts"
import { buildSelectFromInclude, includeSchema } from "../include.ts"

import { bodyInputSchema } from "./schemas/json-body.ts"
import { queryInputSchema } from "./schemas/query-params.ts"

export const v2Routes = new Hono()
	.get("/ids", sValidator("query", queryInputSchema, validationHook), async (c) => {
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
		sValidator("json", bodyInputSchema, validationHook),
		sValidator("query", includeSchema, validationHook),
		async (c) => {
			const input = await c.req.json<InferOutput<typeof bodyInputSchema>>()
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
