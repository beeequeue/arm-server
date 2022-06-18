import { FastifyPluginAsync, FastifyRequest } from "fastify"

import { Relation } from "@/db"
import { bodyHandler, bodyInputSchema, BodyQuery } from "@/schemas/json-body"
import {
  handleQueryParams,
  queryInputSchema,
  QueryParamQuery,
} from "@/schemas/query-params"
import { responseBodySchema } from "@/schemas/response"
import { isEmpty } from "@/utils"

/* eslint-disable @typescript-eslint/naming-convention */
type BodyInput = { Body: BodyQuery }
type QueryInput = { Querystring: QueryParamQuery }

/* eslint-disable @typescript-eslint/no-unsafe-argument */
const handler = async (
  request: FastifyRequest<BodyInput | QueryInput>,
): Promise<Relation | Relation[] | null> => {
  const isBodyQuery = isEmpty(request.query as any)

  if (isBodyQuery) {
    return (await bodyHandler(request.body as any)) ?? null
  }

  return (await handleQueryParams(request.query as any)) ?? null
}
/* eslint-enable */

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
