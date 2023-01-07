import { JSONSchema7 } from "json-schema"

const nullSchema = { type: "null" } satisfies JSONSchema7
export const makeNullable = <Input extends JSONSchema7>(...input: Input[]) => ({
  oneOf: [nullSchema, ...input],
})

export const oldSourceSchema = {
  type: "string",
  enum: ["anilist", "anidb", "myanimelist", "kitsu"],
} satisfies JSONSchema7

export const numberIdSchema = {
  type: "integer",
  minimum: 0,
  maximum: 50_000_000,
} satisfies JSONSchema7

export const stringIdSchema = {
  type: "string",
  minLength: 1,
  maxLength: 150,
} satisfies JSONSchema7

export const imdbIdSchema = {
  type: "string",
  pattern: "tt\\d+",
  minLength: 1,
  maxLength: 50,
} satisfies JSONSchema7
