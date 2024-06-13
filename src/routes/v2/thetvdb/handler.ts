import type { FastifyPluginAsync } from "fastify"

import { responseArraySchema } from "../ids/schemas/response"
import type { IncludeQuery } from "../include"
import { buildSelectFromInclude, includeSchema } from "../include"

import { knex, Source } from "@/db"
import type { Relation } from "@/db"
import { makeNullable } from "@/shared-schemas"
import { cacheReply, CacheTimes, mergeSchemas } from "@/utils"
import type { TheTVDBQuery } from "./schemas/thetvdb"
import { thetvdbInputSchema } from "./schemas/thetvdb"

export const thetvdbPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: TheTVDBQuery & IncludeQuery }>(
    "/thetvdb",
    {
      schema: {
        querystring: mergeSchemas(thetvdbInputSchema, includeSchema),
        response: {
          200: makeNullable(responseArraySchema),
        },
      },
    },
    async (request, reply): Promise<Relation[] | null> => {
      const data = await knex
        .select(buildSelectFromInclude(request))
        .where({ [Source.TheTVDB]: request.query.id })
        .from("relations")

      cacheReply(reply, CacheTimes.SIX_HOURS)

      return data
    },
  )
}
