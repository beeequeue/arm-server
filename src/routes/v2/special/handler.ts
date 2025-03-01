import { sValidator } from "@hono/standard-validator"
import { Hono } from "hono"

import { knex, Source } from "../../../db.ts"
import { cacheReply, CacheTimes, validationHook } from "../../../utils.ts"
import { buildSelectFromInclude } from "../include.ts"

import { specialImdbInputSchema, specialInputSchema } from "./schemas/special.ts"

export const specialRoutes = new Hono()
	.get(
		"/imdb",
		sValidator("query", specialImdbInputSchema, validationHook),
		async (c) => {
			const query = c.req.query()

			const data = await knex
				.select(buildSelectFromInclude(query.include))
				.where({ [Source.IMDB]: query.id })
				.from("relations")

			cacheReply(c.res, CacheTimes.SIX_HOURS)

			return c.json(data)
		},
	)
	.get(
		"/themoviedb",
		sValidator("query", specialInputSchema, validationHook),
		async (c) => {
			const query = c.req.query()

			const data = await knex
				.select(buildSelectFromInclude(query.include))
				.where({ [Source.TheMovieDB]: query.id })
				.from("relations")

			cacheReply(c.res, CacheTimes.SIX_HOURS)

			return c.json(data)
		},
	)
	.get("/thetvdb", sValidator("query", specialInputSchema, validationHook), async (c) => {
		const query = c.req.query()

		const data = await knex
			.select(buildSelectFromInclude(query.include))
			.where({ [Source.TheTVDB]: query.id })
			.from("relations")

		cacheReply(c.res, CacheTimes.SIX_HOURS)

		return c.json(data)
	})
