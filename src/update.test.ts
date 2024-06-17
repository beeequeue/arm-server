import { $fetch } from "ofetch/node"
import { groupBy } from "rambda"
import { afterAll, afterEach, expect, it, vi } from "vitest"

import { type Relation, Source, knex } from "./db.js"
import {
	type AnimeListsSchema,
	formatEntry,
	removeDuplicates,
	updateRelations,
} from "./update.js"

declare const fetch: (url: string) => Promise<{ json: () => Promise<any[]> }>

vi.mock("ofetch/node")

afterEach(async () => {
	vi.resetAllMocks()
	await knex.delete().from("relations")
})

afterAll(async () => {
	await Promise.all([knex.destroy()])
})

const mockedFetch = vi.mocked($fetch)

it("handles bad values", async () => {
	mockedFetch.mockResolvedValue([
		{ anidb_id: 1337, themoviedb_id: "unknown" },
		{ anidb_id: 1338, thetvdb_id: "unknown" as never },
		{ anidb_id: 1339, imdb_id: "tt1337,tt1338,tt1339" },
		{ anidb_id: 1340, themoviedb_id: "unknown" },
		{ anidb_id: 1341, themoviedb_id: 1341 },
	] satisfies AnimeListsSchema)

	await updateRelations()

	await expect(
		knex.from("relations").select(["anidb", "imdb", "themoviedb", "thetvdb"]),
	).resolves.toMatchInlineSnapshot(`
    [
      {
        "anidb": 1337,
        "imdb": null,
        "themoviedb": null,
        "thetvdb": null,
      },
      {
        "anidb": 1338,
        "imdb": null,
        "themoviedb": null,
        "thetvdb": null,
      },
      {
        "anidb": 1339,
        "imdb": null,
        "themoviedb": null,
        "thetvdb": null,
      },
      {
        "anidb": 1340,
        "imdb": null,
        "themoviedb": null,
        "thetvdb": null,
      },
      {
        "anidb": 1341,
        "imdb": null,
        "themoviedb": 1341,
        "thetvdb": null,
      },
    ]
  `)
})

it.only("handles duplicates", async () => {
	const entries: Relation[] = await fetch(
		"https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json",
	)
		.then((r) => r.json())
		.then((e) => e.map(formatEntry))

	// There should be >=5 Konosuba entries
	const konosubaEntries = entries.filter(({ themoviedb }) => themoviedb === 65844)
	expect(konosubaEntries.length).toBeGreaterThanOrEqual(5)

	const results = removeDuplicates(entries)

	// There should still be 5 Konosuba entries
	expect(results.filter(({ themoviedb }) => themoviedb === 65844).length).toBe(
		konosubaEntries.length,
	)

	const goodSources = [
		Source.AniDB,
		Source.AniList,
		Source.AnimePlanet,
		Source.AniSearch,
		Source.Kitsu,
		Source.LiveChart,
		Source.NotifyMoe,
		Source.MAL,
	]

	// Check if any sources have duplicate ids
	const duplicates = Object.fromEntries(
		goodSources.map((source) => {
			const groups = groupBy((e) => e[source]?.toString() ?? "undefined", results)
			return [
				source,
				Object.fromEntries(
					Object.entries(groups)
						.filter(([id, g]) => id !== "undefined" && id !== "null" && g.length > 1)
						.map(([id, g]) => [id, g.length]),
				),
			]
		}),
	)
	for (const goodSource of goodSources) {
		expect(duplicates[goodSource], `${goodSource} has duplicates`).toStrictEqual({})
	}

	const findEntry = (source: Source, id: number | string) =>
		results.find((entry) => entry[source] === id)
	expect(findEntry(Source.AniDB, 11261)).toBeDefined()
	expect(findEntry(Source.AniDB, 11992)).toBeDefined()
})
