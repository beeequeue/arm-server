import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"

import type { BodyQuery } from "./schemas/json-body"
import { bodyHandler, bodyInputSchema } from "./schemas/json-body"
import type { QueryParamQuery } from "./schemas/query-params"
import { handleQueryParams, queryInputSchema } from "./schemas/query-params"
import { responseBodySchema } from "./schemas/response"
import type { Relation } from "@/db"

type BodyInput = { Body: BodyQuery }
type QueryInput = { Querystring: QueryParamQuery }

const isBodyQuery = (
  request: FastifyRequest<BodyInput | QueryInput>,
): request is FastifyRequest<BodyInput> => request.method === "POST"

const handler = async (
  request: FastifyRequest<BodyInput> | FastifyRequest<QueryInput>,
  reply: FastifyReply,
): Promise<Relation | Relation[] | null> => {
  if (isBodyQuery(request)) {
    return (await bodyHandler(request.body)) ?? null
  }

  // eslint-disable-next-line ts/no-unsafe-return
  return (await handleQueryParams(request, reply)) ?? null
}

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
