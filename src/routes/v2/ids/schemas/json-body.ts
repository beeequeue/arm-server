import type { JSONSchema7 } from "json-schema"

import type { Relation } from "@/db"
import { imdbIdSchema, makeNullable, numberIdSchema, stringIdSchema } from "@/shared-schemas"

// Does not include `thetvdb` due to the one-to-many issue
type BodyItem = Omit<Relation, "thetvdb">

const nullableNumberIdSchema = makeNullable(numberIdSchema)
const nullableStringIdSchema = makeNullable(stringIdSchema)
const nullableImdbIdSchema = makeNullable(imdbIdSchema)

export const singularItemInputSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  // Does not include `thetvdb` due to the one-to-many issue
  properties: {
    anidb: nullableNumberIdSchema,
    anilist: nullableNumberIdSchema,
    "anime-planet": nullableStringIdSchema,
    anisearch: nullableNumberIdSchema,
    imdb: nullableImdbIdSchema,
    kitsu: nullableNumberIdSchema,
    livechart: nullableNumberIdSchema,
    "notify-moe": nullableStringIdSchema,
    themoviedb: nullableNumberIdSchema,
    myanimelist: nullableNumberIdSchema,
  },
} satisfies JSONSchema7

export type BodyQuery = BodyItem | BodyItem[]

const arrayInputSchema = {
  type: "array",
  minItems: 1,
  maxItems: 100,
  items: singularItemInputSchema,
} satisfies JSONSchema7

export const bodyInputSchema = {
  oneOf: [singularItemInputSchema, arrayInputSchema],
} satisfies JSONSchema7
