import { FetchMocker, MockServer } from "mentoss"
import { afterAll, afterEach, beforeEach, expect, it, vi } from "vitest"

import { db, type Relation, Source } from "./db.ts"
import {
	type AnimeListsSchema,
	formatEntry,
	removeDuplicates,
	updateRelations,
} from "./update.ts"

// create a new server with the given base URL
const server = new MockServer("https://raw.githubusercontent.com")
const mocker = new FetchMocker({ servers: [server] })

beforeEach(() => {
	mocker.mockGlobal()
})

afterEach(async () => {
	mocker.clearAll()
	vi.resetAllMocks()
	await db.deleteFrom("relations").execute()
})

afterAll(async () => {
	mocker.unmockGlobal()
	await db.destroy()
})

it("handles bad values", async () => {
	server.get("/Fribb/anime-lists/master/anime-list-full.json", {
		status: 200,
		body: [
			{ anidb_id: 1337, themoviedb_id: "unknown" },
			{ anidb_id: 1338, thetvdb_id: "unknown" as never },
			{ anidb_id: 1339, imdb_id: "tt1337,tt1338,tt1339" },
			{ anidb_id: 1340, themoviedb_id: "unknown" },
			{ anidb_id: 1341, themoviedb_id: 1341 },
		] satisfies AnimeListsSchema,
	})

	await updateRelations()

	await expect(
		db
			.selectFrom("relations")
			.select([
				"relations.anidb",
				"relations.imdb",
				"relations.themoviedb",
				"relations.thetvdb",
			]),
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

it("handles duplicates", async () => {
	mocker.unmockGlobal()

	const entries: Relation[] = await fetch(
		"https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json",
	)
		.then(async (r) => r.json())
		.then((e) => (e as any[]).map(formatEntry))

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
			const groups = Object.groupBy(results, (e) => e[source]?.toString() ?? "undefined")

			return [
				source,
				Object.fromEntries(
					Object.entries(groups)
						.filter(([id, g]) => id !== "undefined" && id !== "null" && g!.length > 1)
						.map(([id, g]) => [id, g!.length]),
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
