import { JSONSchema7 } from "json-schema"

export enum Source {
  AniList = "anilist",
  AniDB = "anidb",
  MAL = "myanimelist",
  Kitsu = "kitsu",
}

export const sourceSchema: JSONSchema7 = {
  type: "string",
  enum: Object.values(Source),
}

export const idSchema: JSONSchema7 = {
  type: "integer",
  minimum: 0,
  maximum: 50_000_000,
}
