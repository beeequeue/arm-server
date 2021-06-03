import Knex from "knex"

import { config } from "../knexfile"

export const knex = Knex(config)

export type Relation = {
  anilist?: number
  anidb?: number
  myanimelist?: number
  kitsu?: number
}
