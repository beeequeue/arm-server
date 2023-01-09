import { FastifyReply, FastifyRequest } from "fastify"
import { JSONSchema7 } from "json-schema"

import { knex, Source } from "@/db"
import { numberIdSchema, oldSourceSchema } from "@/shared-schemas"
import { cacheReply, CacheTimes } from "@/utils"

export type QueryParamQuery = {
  source: Source
  id: number
}

export const queryInputSchema: JSONSchema7 = {
  type: "object",
  properties: {
    source: oldSourceSchema,
    id: numberIdSchema,
  },
  required: ["source", "id"],
}

export const handleQueryParams = async (
  request: FastifyRequest<{ Querystring: QueryParamQuery }>,
  reply: FastifyReply,
) => {
  const data = await knex
    .select(["anidb", "anilist", "myanimelist", "kitsu"])
    .where({ [request.query.source]: request.query.id })
    .from("relations")
    .first()

  cacheReply(reply, CacheTimes.SIX_HOURS)

  return data
}
