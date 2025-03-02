import Knex from "knex"

import knexfile from "./knexfile"

const knex = Knex(knexfile)

// eslint-disable-next-line antfu/no-top-level-await
await knex.migrate.latest()
