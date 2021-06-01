import { FastifyPluginAsync, FastifyRequest } from "fastify"

import { bodyHandler, bodyInputSchema, BodyQuery } from "@/schemas/json-body"
import {
  handleQueryParams,
  queryInputSchema,
  QueryParamQuery,
} from "@/schemas/query-params"
import { isEmpty } from "@/utils"

// eslint-disable-next-line @typescript-eslint/naming-convention
type BodyInput = { Body: BodyQuery; Querystring: undefined }
// eslint-disable-next-line @typescript-eslint/naming-convention
type QueryInput = { Body: undefined; Querystring: QueryParamQuery }

const handler = async (request: FastifyRequest<BodyInput | QueryInput>) => {
  const isBodyQuery = isEmpty(request.query)

  if (isBodyQuery) {
    return await bodyHandler(request.body!)
  }

  return await handleQueryParams(request.query!)
}

export const apiPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get<QueryInput>("/ids", { schema: { querystring: queryInputSchema } }, handler)

  fastify.post<BodyInput>("/ids", { schema: { body: bodyInputSchema } }, handler)
}
