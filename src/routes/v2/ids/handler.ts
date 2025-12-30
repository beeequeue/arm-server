import { getValidatedQuery, H3, handleCacheHeaders, readValidatedBody } from "h3"

import { db, type Relation, type SourceValue } from "../../../db/db.ts"
import { CacheTimes } from "../../../utils.ts"
import { buildSelectFromInclude, includeSchema } from "../include.ts"

import { bodyInputSchema } from "./schemas/json-body.ts"
import { queryInputSchema } from "./schemas/query-params.ts"

export const v2Routes = new H3()
	.get("/ids", async (event) => {
		const query = await getValidatedQuery(event, queryInputSchema)
		const selectFields = buildSelectFromInclude(query.include)

		const data = await db
			.selectFrom("relations")
			.select(selectFields)
			.where(query.source as keyof Relation, "=", query.id)
			.executeTakeFirst()

		handleCacheHeaders(event, { maxAge: CacheTimes.SIX_HOURS })

		return data ?? null
	})
	.post("/ids", async (event) => {
		const input = await readValidatedBody(event, bodyInputSchema)
		const query = await getValidatedQuery(event, includeSchema)

		const selectFields = buildSelectFromInclude(query.include)

		if (!Array.isArray(input)) {
			// Single item query
			const [key, value] = Object.entries(input)[0]

			const relation = await db
				.selectFrom("relations")
				.select(selectFields)
				.where(key as keyof Relation, "=", value)
				.executeTakeFirst()

			return relation ?? null
		}

		let relations: Array<Relation | null> = []

		// Get relations with multiple OR conditions
		if (input.length > 0) {
			let query = db.selectFrom("relations").select(selectFields)

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

		return relations
	})
