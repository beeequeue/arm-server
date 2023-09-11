import Ajv from "ajv"
import { JsonValue } from "type-fest"
import { describe, expect, test } from "vitest"

import { Relation } from "@/db"

import { bodyInputSchema } from "./json-body"

type Case<V> = [V, boolean]
type Cases<V = JsonValue> = Array<Case<V>>

const okCases = [
  [{ anilist: 1337 }, true],
  [{ anidb: 1337 }, true],
  [{ anidb: 1337, anilist: 1337 }, true],
  [{ anidb: 1337, anilist: 1337, myanimelist: 1337, kitsu: 1337 }, true],
] satisfies Cases<Relation>

const badCases = [
  // No source
  [{}, false],
  // Invalid ID (negative)
  [{ anilist: -1 }, false],
  // Invalid ID (not integer)
  [{ anilist: 1.5 }, false],
  [{ anidb: 1.5 }, false],
  // Invalid source
  [{ aniDb: 1337 }, false],
  [{ aniList: 1337 }, false],
  [{ anidb: 1337, test: 123 }, false],
] satisfies Cases

const mapToSingularArrayInput = (cases: Cases): Cases => cases.map(([input, expected]) => [[input], expected])

describe("schema", () => {
  const inputs = [
    ...okCases,
    ...badCases,
    [[], false],
    ...mapToSingularArrayInput(okCases),
    ...mapToSingularArrayInput(badCases),
  ] satisfies Cases

  const ajv = new Ajv()
  const validate = ajv.compile(bodyInputSchema)

  test.each(inputs)("%o = %s", (input, expected) => {
    validate(input)

    const { errors } = validate
    if (expected) {
      expect(errors).toBeNull()
    } else {
      expect(errors?.length).toBeGreaterThanOrEqual(1)
    }
  })
})
