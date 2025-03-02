import Knex from "knex"

import knexfile from "./knexfile"

const knex = Knex(knexfile)

await knex.migrate.latest()
