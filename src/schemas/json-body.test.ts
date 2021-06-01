import { TsjsonParser } from "ts-json-validator"
import { JsonValue } from "type-fest"

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

  const parser = new TsjsonParser(bodyInputSchema)

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
