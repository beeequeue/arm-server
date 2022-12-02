import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"

import { Relation } from "@/db"
import { bodyHandler, bodyInputSchema, BodyQuery } from "@/schemas/json-body"
import {
  handleQueryParams,
  queryInputSchema,
  QueryParamQuery,
} from "@/schemas/query-params"
import { responseBodySchema } from "@/schemas/response"
import { isEmpty } from "@/utils"

type BodyInput = { Body: BodyQuery }
type QueryInput = { Querystring: QueryParamQuery }

const isBodyQuery = (
  request: FastifyRequest<BodyInput | QueryInput>,
): request is FastifyRequest<BodyInput> => isEmpty(request.query as QueryParamQuery)

const handler = async (
  request: FastifyRequest<BodyInput> | FastifyRequest<QueryInput>,
  reply: FastifyReply,
): Promise<Relation | Relation[] | null> => {
  if (isBodyQuery(request)) {
    return (await bodyHandler(request.body)) ?? null
  }

  return (await handleQueryParams(request, reply)) ?? null
}

// eslint-disable-next-line @typescript-eslint/require-await
export const apiPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get<QueryInput>(
    "/ids",
    {
      schema: {
        querystring: queryInputSchema,
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
        body: bodyInputSchema,
        response: {
          200: responseBodySchema,
        },
      },
    },
    handler,
  )
}
