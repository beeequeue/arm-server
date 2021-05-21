import Knex from "knex"

import { Relation } from "../api/_types"
import { config } from "../knexfile"

const knex = Knex(config.test)

afterAll(() => knex.destroy())

export const cleanUpDb = async () => {
  return knex.delete().from("relations")
}

export const insertRelations = async (relations: Partial<Relation>[]) => {
  await knex.insert(relations).into("relations")

  return relations
}
