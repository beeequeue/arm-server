import { enumToArray } from '@/utils'
import Joi from 'joi'

export enum Source {
  ANILIST = 'anilist',
  ANIDB = 'anidb',
  MAL = 'myanimelist',
  KITSU = 'kitsu',
}

export const sourceArray = (enumToArray(Source) as unknown) as string[]

export const idSchema = Joi.number()
  .min(0)
  .max(2147483647)
  .precision(0)
  .required()
