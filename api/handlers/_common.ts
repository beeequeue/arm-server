import Joi from "joi"

export enum Source {
  AniList = "anilist",
  AniDB = "anidb",
  MAL = "myanimelist",
  Kitsu = "kitsu",
}

export const sourceArray = Object.values(Source)

export const idSchema = Joi.number().min(0).max(2147483647).precision(0).required()
