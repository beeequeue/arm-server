import { createSchema as S } from "ts-json-validator"

import { enumToArray } from "@/utils"

export enum Source {
  AniList = "anilist",
  AniDB = "anidb",
  MAL = "myanimelist",
  Kitsu = "kitsu",
}

export const sourceSchema = S({
  type: "string",
  enum: enumToArray(Source),
})

export const idSchema = S({
  type: "integer",
  minimum: 0,
  maximum: 50_000_000,
})
