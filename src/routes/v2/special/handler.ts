import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

import { knex, Source } from "../../../db.js"
import { cacheReply, CacheTimes, zHook } from "../../../utils.js"
import { buildSelectFromInclude } from "../include.js"

import { specialImdbInputSchema, specialInputSchema } from "./schemas/special.js"

export const specialRoutes = new Hono()
	.get("/imdb", zValidator("query", specialImdbInputSchema, zHook), async (c) => {
		const query = c.req.query()

		const data = await knex
			.select(buildSelectFromInclude(query.include))
			.where({ [Source.IMDB]: query.id })
			.from("relations")

		cacheReply(c.res, CacheTimes.SIX_HOURS)

		return c.json(data)
	})
	.get("/themoviedb", zValidator("query", specialInputSchema, zHook), async (c) => {
		const query = c.req.query()

		const data = await knex
			.select(buildSelectFromInclude(query.include))
			.where({ [Source.TheMovieDB]: query.id })
			.from("relations")

		cacheReply(c.res, CacheTimes.SIX_HOURS)

		return c.json(data)
	})
	.get("/thetvdb", zValidator("query", specialInputSchema, zHook), async (c) => {
		const query = c.req.query()

		const data = await knex
			.select(buildSelectFromInclude(query.include))
			.where({ [Source.TheTVDB]: query.id })
			.from("relations")

		cacheReply(c.res, CacheTimes.SIX_HOURS)

		return c.json(data)
	})
