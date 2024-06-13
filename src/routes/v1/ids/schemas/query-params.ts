import type { FastifyReply, FastifyRequest } from "fastify"
import type { JSONSchema7 } from "json-schema"

import type { Source } from "@/db"
import { knex } from "@/db"
import { numberIdSchema, oldSourceSchema } from "@/shared-schemas"
import { CacheTimes, cacheReply } from "@/utils"

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

  // eslint-disable-next-line ts/no-unsafe-return
  return data
}
