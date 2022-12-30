import { JSONSchema7 } from "json-schema"

const nullSchema: JSONSchema7 = { type: "null" }
export const makeNullable = (...input: JSONSchema7[]): JSONSchema7 => ({
  oneOf: [nullSchema, ...input],
})

export enum Source {
  AniList = "anilist",
  AniDB = "anidb",
  MAL = "myanimelist",
  Kitsu = "kitsu",
}

export const oldSourceSchema: JSONSchema7 = {
  type: "string",
  enum: Object.values(Source),
}

export const numberIdSchema: JSONSchema7 = {
  type: "integer",
  minimum: 0,
  maximum: 50_000_000,
}

export const stringIdSchema: JSONSchema7 = {
  type: "string",
  minLength: 1,
  maxLength: 50,
}

export const imdbIdSchema: JSONSchema7 = {
  type: "string",
  pattern: "tt\\d+",
  minLength: 1,
  maxLength: 50,
}
