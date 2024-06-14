import { Hono } from "hono"

import { zValidator } from "@hono/zod-validator"

import { type OldRelation, type Relation, type Source, knex } from "../../../db.js"
import { CacheTimes, cacheReply } from "../../../utils.js"

import { bodyInputSchema } from "./schemas/json-body.js"
import { queryInputSchema } from "./schemas/query-params.js"

export const v1Routes = new Hono()
  .get("/ids", zValidator("query", queryInputSchema), async (c) => {
    const query = c.req.query()

    const row = await knex
      .select(["anidb", "anilist", "myanimelist", "kitsu"])
      .where({ [query.source]: query.id })
      .from("relations")
      .first()

    cacheReply(c.res, CacheTimes.SIX_HOURS)

    return c.json(row as OldRelation ?? null)
  })
  .post("/ids", zValidator("json", bodyInputSchema), async (c) => {
    const input = await c.req.json()

    if (!Array.isArray(input)) {
      const relation = await knex
        .select(["anidb", "anilist", "myanimelist", "kitsu"])
        .where(input)
        .from("relations")
        .first()

      return c.json(relation ?? null)
    }

    let relations: Array<Relation | null> = []

    // Get relations
    relations = await knex
      .select(["anidb", "anilist", "myanimelist", "kitsu"])
      .where(function() {
        // eslint-disable-next-line ts/no-floating-promises
        for (const item of input) this.orWhere(item)
      })
      .from("relations")

    // Map them against the input, so we get results like [{item}, null, {item}]
    relations = input.map((item) => {
      const realItem = Object.entries(item)[0] as [Source, number]

      return relations.find((relation) => relation![realItem[0]] === realItem[1]) ?? null
    })

    return c.json(relations)
  })
