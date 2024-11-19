import type { JsonValue } from "type-fest"
import { describe, expect, it } from "vitest"

import { Source } from "../../../../db.ts"

import { queryInputSchema, type QueryParamQuery } from "./query-params.ts"

type Case<V> = [V, boolean]
type Cases<V = JsonValue> = Array<Case<V>>

const okCases = [
	[{ source: Source.AniList, id: 1337 }, true],
	[{ source: Source.AniDB, id: 1337 }, true],
	[{ source: Source.MAL, id: 1337 }, true],
	[{ source: Source.Kitsu, id: 1337 }, true],
	[{ source: Source.Kitsu, id: 133_700 }, true],
	[{ source: Source.AnimePlanet, id: "1337" }, true],
] satisfies Cases<QueryParamQuery>

const badCases: Cases = [
	[{}, false],
	[{ id: 1337 }, false],
	[{ source: Source.AniList }, false],
	[{ source: Source.AniList, id: null }, false],
	[{ source: Source.AniList, id: -1234 }, false],
	[{ source: Source.AniList, id: 50_000_001 }, false],
	[{ source: Source.IMDB, id: "tt1337" }, false],
	[{ source: Source.TheTVDB, id: 1337 }, false],
]

describe("schema", () => {
	const inputs = [...okCases, ...badCases] satisfies Cases

	it.each(inputs)("%o = %s", (input, expected) => {
		const result = queryInputSchema.safeParse(input)

		if (expected) {
			expect(result.error?.errors).not.toBeDefined()
		} else {
			expect(result.error?.errors.length ?? 0).toBeGreaterThanOrEqual(1)
		}
	})
})
