import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"

import { knex, Relation, Source } from "@/db"
import { buildSelectFromInclude, IncludeQuery, includeSchema } from "@/routes/v2/include"
import { mergeSchemas } from "@/utils"

import { bodyInputSchema, BodyQuery } from "../schemas/json-body"
import { queryInputSchema, QueryParamQuery } from "../schemas/query-params"
import { responseBodySchema } from "../schemas/response"

type BodyInput = { Body: BodyQuery; Querystring: IncludeQuery }
type QueryInput = { Querystring: QueryParamQuery & IncludeQuery }

const isBodyQuery = (
  request: FastifyRequest<BodyInput | QueryInput>,
): request is FastifyRequest<BodyInput> => request.method === "POST"

const bodyHandler = async (
  request: FastifyRequest<BodyInput>,
): Promise<BodyQuery extends Array<undefined> ? Array<Relation | null> : Relation> => {
  const input = request.body

  if (!Array.isArray(input)) {
    const relation = await knex
      .select(buildSelectFromInclude(request))
      .where(input)
      .from("relations")
      .first()

    return relation ?? null!
  }

  let relations: Array<Relation | null> = []

  // Get relations
  relations = await knex
    .select(buildSelectFromInclude(request))
    .where(function () {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      for (const item of input) this.orWhere(item)
    })
    .from("relations")

  // Map them against the input, so we get results like [{item}, null, {item}]
  relations = input.map((item) => {
    const realItem = Object.entries(item)[0] as [Source, number]

    return relations.find((relation) => relation![realItem[0]] === realItem[1]) ?? null
  })

  return relations as never
}

const handleQueryParams = async (
  request: FastifyRequest<QueryInput>,
  reply: FastifyReply,
) => {
  const data = await knex
    .select(buildSelectFromInclude(request))
    .where({ [request.query.source]: request.query.id })
    .from("relations")
    .first()

  void reply.header("Cache-Control", "public,max-age=10800")

  return data
}

const handler = async (
  request: FastifyRequest<BodyInput> | FastifyRequest<QueryInput>,
  reply: FastifyReply,
): Promise<Relation | Relation[] | null> => {
  if (isBodyQuery(request)) {
    return (await bodyHandler(request)) ?? null
  }

  return (await handleQueryParams(request, reply)) ?? null
}

// eslint-disable-next-line @typescript-eslint/require-await
export const v2Plugin: FastifyPluginAsync = async (fastify) => {
  fastify.get<QueryInput>(
    "/ids",
    {
      schema: {
        querystring: mergeSchemas(queryInputSchema, includeSchema),
        response: {
          200: responseBodySchema,
        },
      },
    },
    handler,
  )

  fastify.post<BodyInput>(
    "/ids",
    {
      schema: {
        querystring: includeSchema,
        body: bodyInputSchema,
        response: {
          200: responseBodySchema,
        },
      },
    },
    handler,
  )
}
