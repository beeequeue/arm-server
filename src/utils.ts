import { JSONSchema7 } from "json-schema"

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
