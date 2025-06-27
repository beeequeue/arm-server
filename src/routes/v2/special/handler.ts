import { sValidator } from "@hono/standard-validator"
import { Hono } from "hono"

import { db, Source } from "../../../db.ts"
import { cacheReply, CacheTimes, validationHook } from "../../../utils.ts"
import { buildSelectFromInclude } from "../include.ts"

import { specialImdbInputSchema, specialInputSchema } from "./schemas/special.ts"

export const specialRoutes = new Hono()
	.get(
		"/imdb",
		sValidator("query", specialImdbInputSchema, validationHook),
		async (c) => {
			const query = c.req.valid("query")
			const selectFields = buildSelectFromInclude(query.include)

			const data = await db
				.selectFrom("relations")
				.select(selectFields)
				.where(Source.IMDB, "=", query.id)
				.execute()

			cacheReply(c.res, CacheTimes.SIX_HOURS)

			return c.json(data)
		},
	)
	.get(
		"/themoviedb",
		sValidator("query", specialInputSchema, validationHook),
		async (c) => {
			const query = c.req.valid("query")
			const selectFields = buildSelectFromInclude(query.include)

			const data = await db
				.selectFrom("relations")
				.select(selectFields)
				.where(Source.TheMovieDB, "=", query.id)
				.execute()

			cacheReply(c.res, CacheTimes.SIX_HOURS)

			return c.json(data)
		},
	)
	.get("/thetvdb", sValidator("query", specialInputSchema, validationHook), async (c) => {
		const query = c.req.valid("query")
		const selectFields = buildSelectFromInclude(query.include)

		const data = await db
			.selectFrom("relations")
			.select(selectFields)
			.where(Source.TheTVDB, "=", query.id)
			.execute()

		cacheReply(c.res, CacheTimes.SIX_HOURS)

		return c.json(data)
	})
