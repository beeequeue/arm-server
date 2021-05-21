import KnexBuilder, { Knex as IKnex } from "knex"

import { config } from "../knexfile"

import { Relation } from "./_types"

declare module "knex/types/tables" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Tables {
    relations: Relation
    // eslint-disable-next-line @typescript-eslint/naming-convention
    relations_composite: IKnex.CompositeTableType<Relation, Relation, Relation>
  }
}

const env = (process.env.NODE_ENV as keyof typeof config) || "production"
export const Knex = KnexBuilder(config[env])
