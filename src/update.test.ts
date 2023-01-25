import { $fetch } from "ohmyfetch/node"
import { groupBy } from "remeda"
import { afterAll, afterEach, expect, it, vi } from "vitest"

import { knex, Relation } from "@/db"
import {
  AnimeListsSchema,
  formatEntry,
  removeDuplicates,
  updateRelations,
} from "@/update"

declare const fetch: (url: string) => Promise<any>

vi.mock("ohmyfetch/node")

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
    { anidb_id: 1338, thetvdb_id: "unknown" as any },
    { anidb_id: 1339, imdb_id: "tt1337,tt1338,tt1339" },
    { anidb_id: 1340, themoviedb_id: "unknown" },
    { anidb_id: 1341, themoviedb_id: 1341 },
  ] satisfies AnimeListsSchema)

  await updateRelations()

  await expect(knex.from("relations").select(["anidb", "imdb", "themoviedb", "thetvdb"]))
    .resolves.toMatchInlineSnapshot(`
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
  const entries: Relation[] = await fetch(
    "https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json",
  )
    .then((r) => r.json())
    .then((e) => e.map(formatEntry))

  const groups = groupBy(removeDuplicates(entries), (e) => e.imdb!)
  expect(
    Object.fromEntries(
      Object.entries(groups)
        .filter(([id, g]) => id !== "undefined" && g.length > 1)
        .map(([id, g]) => [id, g.length]),
    ),
  ).toStrictEqual({})
})
