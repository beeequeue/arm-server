import type { Context } from "hono"
import type { JSONSchema7 } from "json-schema"
import type { TypeOf, ZodError, z } from "zod"

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

export const zHook = <T extends z.ZodType<any, z.ZodTypeDef, any>>(result: TypeOf<T>, c: Context) => {
  if (result.success === true) return

  const flat = (result.error as ZodError).flatten()
  const messages = [
    ...flat.formErrors,
    ...Object.entries(flat.fieldErrors).map(([key, value]) => `${key}: ${value?.join(", ") ?? "error"}`),
  ]

  c.status(400)
  return c.json({
    code: "FST_ERR_VALIDATION",
    error: "Bad Request",
    statusCode: 400,
    message: messages.join(", "),
  })
}

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
