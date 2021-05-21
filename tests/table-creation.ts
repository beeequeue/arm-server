import { rmSync } from "fs"
import { resolve } from "path"
import { config } from "../knexfile"
import Knex from "knex"

const dbFile = resolve(__dirname, config.test.connection.filename)

;(async () => {
  rmSync(dbFile, { force: true })

  const sources = ["anilist", "anidb", "myanimelist", "kitsu"]

  const knex = Knex(config.test)

  if (!(await knex.schema.hasTable("relations"))) {
    await knex.schema.createTable("relations", (table) => {
      sources.forEach((source) => {
        table.integer(source).defaultTo(null)
      })

      table.index(sources)
    })
  }

  await knex.destroy()
})()
