import { getValidatedQuery, H3, handleCacheHeaders } from "h3"

import { db, Source } from "../../../db/db.ts"
import { CacheTimes } from "../../../utils.ts"
import { buildSelectFromInclude } from "../include.ts"

import { specialImdbInputSchema, specialInputSchema } from "./schemas/special.ts"

export const specialRoutes = new H3()
	.get("/imdb", async (event) => {
		const query = await getValidatedQuery(event, specialImdbInputSchema)
		const selectFields = buildSelectFromInclude(query.include)

		const data = await db
			.selectFrom("relations")
			.select(selectFields)
			.where(Source.IMDB, "=", query.id)
			.execute()

		handleCacheHeaders(event, { maxAge: CacheTimes.SIX_HOURS })

		return data
	})
	.get("/themoviedb", async (event) => {
		const query = await getValidatedQuery(event, specialInputSchema)
		const selectFields = buildSelectFromInclude(query.include)

		const data = await db
			.selectFrom("relations")
			.select(selectFields)
			.where(Source.TheMovieDB, "=", query.id)
			.execute()

		handleCacheHeaders(event, { maxAge: CacheTimes.SIX_HOURS })

		return data
	})
	.get("/thetvdb", async (event) => {
		const query = await getValidatedQuery(event, specialInputSchema)
		const selectFields = buildSelectFromInclude(query.include)

		const data = await db
			.selectFrom("relations")
			.select(selectFields)
			.where(Source.TheTVDB, "=", query.id)
			.execute()

		handleCacheHeaders(event, { maxAge: CacheTimes.SIX_HOURS })

		return data
	})
