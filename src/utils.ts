import type { FastifyReply } from "fastify"
import type { JSONSchema7 } from "json-schema"

export const mergeSchemas = <One extends JSONSchema7, Two extends JSONSchema7>(
  one: One,
  two: Two,
): One & Two => ({
  ...one,
  ...two,
  required: [...(one.required ?? []), ...(two.required ?? [])],
  properties: {
    ...one.properties,
    ...two.properties,
  },
})

export enum CacheTimes {
  HOUR = 3600,
  SIX_HOURS = 21_600,
  DAY = 86_400,
  WEEK = 1_209_600,
}

export const cacheReply = (reply: FastifyReply, value: CacheTimes | number | string) => {
  void reply.header("Cache-Control", `public, max-age=${value}`)
}
