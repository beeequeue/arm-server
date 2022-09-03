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
  anilist?: number
  anidb?: number
  myanimelist?: number
  kitsu?: number
}
