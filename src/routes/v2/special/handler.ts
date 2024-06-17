import { Hono } from "hono"

import { zValidator } from "@hono/zod-validator"
import { buildSelectFromInclude } from "../include.js"

import { Source, knex } from "../../../db.js"
import { CacheTimes, cacheReply, zHook } from "../../../utils.js"
import { specialInputSchema } from "./schemas/special.js"

export const specialRoutes = new Hono()
	.get("/thetvdb", zValidator("query", specialInputSchema, zHook), async (c) => {
		const query = c.req.query()

		const data = await knex
			.select(buildSelectFromInclude(query.include))
			.where({ [Source.TheTVDB]: query.id })
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
