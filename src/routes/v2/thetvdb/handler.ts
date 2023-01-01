import { FastifyPluginAsync } from "fastify"

import { knex, Relation, Source } from "@/db"
import { makeNullable } from "@/shared-schemas"
import { mergeSchemas } from "@/utils"

import { buildSelectFromInclude, IncludeQuery, includeSchema } from "../include"
import { responseArraySchema } from "../schemas/response"
import { thetvdbInputSchema, TheTVDBQuery } from "../schemas/thetvdb"

// eslint-disable-next-line @typescript-eslint/require-await
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

      void reply.header("Cache-Control", "public,max-age=10800")

      return data
    },
  )
}
