import type { JsonValue } from "type-fest"
import { describe, expect, it } from "vitest"

import { Source } from "../../../../db.js"

import { queryInputSchema } from "./query-params.js"

type Case = [JsonValue, boolean]
type Cases = Case[]

const okCases: Cases = [
	[{ source: Source.AniList, id: 1337 }, true],
	[{ source: Source.AniDB, id: 1337 }, true],
	[{ source: Source.MAL, id: 1337 }, true],
	[{ source: Source.Kitsu, id: 1337 }, true],
	[{ source: Source.Kitsu, id: 133_700 }, true],
]

const badCases: Cases = [
	[{}, false],
	[{ id: 1337 }, false],
	[{ source: Source.AniList }, false],
	[{ source: Source.AniList, id: null }, false],
	[{ source: Source.AniList, id: -1234 }, false],
	[{ source: Source.AniList, id: 50_000_001 }, false],
]

describe("schema", () => {
	const inputs: Cases = [...okCases, ...badCases]

	it.each(inputs)("%o = %s", (input, expected) => {
		const result = queryInputSchema.safeParse(input)

		if (expected) {
			expect(result.error?.errors).not.toBeDefined()
		} else {
			expect(result.error?.errors.length ?? 0).toBeGreaterThanOrEqual(1)
		}
	})
})
