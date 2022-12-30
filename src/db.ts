import Knex from "knex"

import { config } from "../knexfile"

declare module "knex/types/tables" {
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  interface Tables {
    relations: Relation
  }
}

export const knex = Knex(config)

export type Relation = {
  anidb?: number
  anilist?: number
  "anime-planet"?: string
  anisearch?: number
  imdb?: string
  kitsu?: number
  livechart?: number
  "notify-moe"?: string
  themoviedb?: number
  thetvdb?: number
  myanimelist?: number
}
