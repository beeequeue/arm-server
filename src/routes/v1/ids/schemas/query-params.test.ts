import type { Schema } from "ajv"
import Ajv from "ajv"
import type { JsonValue } from "type-fest"
import { describe, expect, it } from "vitest"

import { Source } from "@/db"
import { queryInputSchema } from "@/routes/v1/ids/schemas/query-params"

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

  const ajv = new Ajv()
  const validate = ajv.compile(queryInputSchema as Schema)

  it.each(inputs)("%o = %s", (input, expected) => {
    validate(input)

    const { errors } = validate
    if (expected) {
      expect(errors).toBeNull()
    } else {
      expect(errors?.length).toBeGreaterThanOrEqual(1)
    }
  })
})
