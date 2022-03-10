import { TsjsonParser } from "ts-json-validator"
import { JsonValue } from "type-fest"
import { describe, expect, test } from "vitest"

import { Source } from "@/schemas/common"
import { queryInputSchema } from "@/schemas/query-params"

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

  const parser = new TsjsonParser(queryInputSchema)

  test.each(inputs)("%s = %p", (input, expected) => {
    parser.validates(input)

    const errors = parser.getErrors()
    if (expected) {
      expect(errors).toBeNull()
    } else {
      expect(errors?.length).toBeGreaterThanOrEqual(1)
    }
  })
})
