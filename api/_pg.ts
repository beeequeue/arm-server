import KnexBuilder, { Knex as IKnex } from "knex"

import { Relation } from "./_types"

declare module "knex/types/tables" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Tables {
    relations: Relation
    // eslint-disable-next-line @typescript-eslint/naming-convention
    relations_composite: IKnex.CompositeTableType<Relation, Relation, Relation>
  }
}

export const Knex = KnexBuilder({
  client: "pg",
  connection: process.env.DATABASE_URL,
})
