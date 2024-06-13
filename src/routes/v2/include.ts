import type { FastifyRequest } from "fastify"
import type { JSONSchema7 } from "json-schema"

import { Source } from "@/db"

export type IncludeQuery = { include?: string }

export const includeSchema = {
  type: "object",
  properties: {
    include: {
      type: "string",
      pattern: "^[\\w,-]+$",
      minLength: 1,
      maxLength: 100,
    },
  },
} satisfies JSONSchema7

const sources = Object.values(Source)
export const buildSelectFromInclude = ({
  query,
}: FastifyRequest<{ Querystring: IncludeQuery }>) => {
  if (query.include == null) {
    return "*"
  }

  return query.include
    .split(",")
    .filter((inclusion) => sources.includes(inclusion as Source))
}
