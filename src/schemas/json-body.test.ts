import Ajv, { Schema } from "ajv"
import { JsonValue } from "type-fest"
import { describe, expect, test } from "vitest"

import { bodyInputSchema } from "@/schemas/json-body"

type Case = [JsonValue, boolean]
type Cases = Case[]

const okCases: Cases = [
  [{ anilist: 1337 }, true],
  [{ anidb: 1337 }, true],
  [{ anidb: 1337, anilist: 1337 }, true],
  [{ anidb: 1337, anilist: 1337, myanimelist: 1337, kitsu: 1337 }, true],
]

const badCases: Cases = [
  [{}, false],
  [{ aniList: 1337 }, false],
  [{ anilist: -1 }, false],
  [{ anilist: 1.5 }, false],
  [{ anidb: 1.5 }, false],
  [{ aniDb: 1337 }, false],
  [{ anidb: 1337, test: 123 }, false],
]

const mapToSingularArrayInput = (cases: Cases): Cases =>
  cases.map(([input, expected]) => [[input], expected])

describe("schema", () => {
  const inputs: Cases = [
    ...okCases,
    ...badCases,
    [[], false],
    ...mapToSingularArrayInput(okCases),
    ...mapToSingularArrayInput(badCases),
  ]

  const ajv = new Ajv()
  const validate = ajv.compile(bodyInputSchema as Schema)

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
