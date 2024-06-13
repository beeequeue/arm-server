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

export const cacheReply = (response: Response, value: CacheTimes | number | string) => {
  response.headers.set("Cache-Control", `public, max-age=${value.toString()}`)

  return response
}
