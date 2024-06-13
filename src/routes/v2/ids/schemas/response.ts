import type { JSONSchema7 } from "json-schema"

import { imdbIdSchema, makeNullable, numberIdSchema, stringIdSchema } from "@/shared-schemas"

const nullableNumberIdSchema = makeNullable(numberIdSchema)
const nullableLongStringIdSchema = makeNullable({
  ...stringIdSchema,
  maxLength: undefined,
})
const nullableImdbIdSchema = makeNullable(imdbIdSchema)

export const responseItemSchema: JSONSchema7 = {
  type: "object",
  additionalProperties: false,
  properties: {
    anidb: nullableNumberIdSchema,
    anilist: nullableNumberIdSchema,
    "anime-planet": nullableLongStringIdSchema,
    anisearch: nullableNumberIdSchema,
    imdb: nullableImdbIdSchema,
    kitsu: nullableNumberIdSchema,
    livechart: nullableNumberIdSchema,
    "notify-moe": nullableLongStringIdSchema,
    themoviedb: nullableNumberIdSchema,
    thetvdb: nullableNumberIdSchema,
    myanimelist: nullableNumberIdSchema,
  },
}

export const responseArraySchema: JSONSchema7 = {
  type: "array",
  items: makeNullable(responseItemSchema),
}

export const responseBodySchema: JSONSchema7 = makeNullable(
  responseItemSchema,
  responseArraySchema,
)
