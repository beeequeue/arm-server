import Joi from "joi"

import { enumToArray } from "@/utils"

export enum Source {
  AniList = "anilist",
  AniDB = "anidb",
  MAL = "myanimelist",
  Kitsu = "kitsu",
}

export const sourceArray = enumToArray(Source) as unknown as string[]

export const idSchema = Joi.number().min(0).max(2_147_483_647).precision(0).required()
