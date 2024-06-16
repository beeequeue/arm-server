import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"

import { type Relation, type Source, knex } from "../../../db.js"
import { CacheTimes, cacheReply, zHook } from "../../../utils.js"
import { buildSelectFromInclude, includeSchema } from "../include.js"
import { bodyInputSchema } from "./schemas/json-body.js"
import { queryInputSchema } from "./schemas/query-params.js"

export const v2Routes = new Hono()
  .get("/ids", zValidator("query", queryInputSchema, zHook), async (c) => {
    const query = c.req.query()
    const data = await knex
      .select(buildSelectFromInclude(query.include))
      .where({ [query.source]: query.id })
      .from("relations")
      .first()

    cacheReply(c.res, CacheTimes.SIX_HOURS)

    return c.json(data as Relation | null ?? null)
  })
  .post("/ids", zValidator("json", bodyInputSchema, zHook), zValidator("query", includeSchema, zHook), async (c) => {
    const input = await c.req.json()
    const query = c.req.query()

    const select = buildSelectFromInclude(query.include)

    if (!Array.isArray(input)) {
      const relation = await knex
        .select(select)
        .where(input)
        .from("relations")
        .first()

      return c.json(relation ?? null)
    }

    let relations: Array<Relation | null> = []

    // Get relations
    relations = await knex
      .select(select)
      .where(function() {
        for (const item of input) void this.orWhere(item)
      })
      .from("relations")

    // Map them against the input, so we get results like [{item}, null, {item}]
    relations = input.map((item) => {
      const realItem = Object.entries(item)[0] as [Source, number]

      return relations.find((relation) => relation![realItem[0]] === realItem[1]) ?? null
    })

    return c.json(relations)
  })
