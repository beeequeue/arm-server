import Ajv from "ajv"
import { JsonValue } from "type-fest"
import { describe, expect, test } from "vitest"

import { Source } from "@/db"

import { queryInputSchema, QueryParamQuery } from "./query-params"

type Case<V> = [V, boolean]
type Cases<V = JsonValue> = Case<V>[]

const okCases = [
  [{ source: Source.AniList, id: 1337 }, true],
  [{ source: Source.AniDB, id: 1337 }, true],
  [{ source: Source.MAL, id: 1337 }, true],
  [{ source: Source.Kitsu, id: 1337 }, true],
  [{ source: Source.Kitsu, id: 133_700 }, true],
  [{ source: Source.AnimePlanet, id: "1337" }, true],
  [{ source: Source.IMDB, id: "tt1337" }, true],
] satisfies Cases<QueryParamQuery>

const badCases: Cases = [
  [{}, false],
  [{ id: 1337 }, false],
  [{ source: Source.AniList }, false],
  [{ source: Source.AniList, id: null }, false],
  [{ source: Source.AniList, id: -1234 }, false],
  [{ source: Source.AniList, id: 50_000_001 }, false],
  [{ source: Source.IMDB, id: "1337" }, false],
  [{ source: Source.TheTVDB, id: 1337 }, false],
]

describe("schema", () => {
  const inputs = [...okCases, ...badCases] satisfies Cases

  const ajv = new Ajv()
  const validate = ajv.compile(queryInputSchema)

  test.each(inputs)("%s = %p", (input, expected) => {
    validate(input)

    const { errors } = validate
    if (expected) {
      expect(errors).toBeNull()
    } else {
      expect(errors?.length).toBeGreaterThanOrEqual(1)
    }
  })
})
