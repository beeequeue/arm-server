import type { JSONSchema7 } from "json-schema"

import { type Relation, type Source, knex } from "@/db"
import { numberIdSchema, oldSourceSchema } from "@/shared-schemas"

type BodyItem = {
  [key in Source]?: number
}

export const singularItemInputSchema: JSONSchema7 = {
  type: "object",
  propertyNames: oldSourceSchema,
  minProperties: 1,
  maxProperties: 4,
  additionalProperties: numberIdSchema,
}

export type BodyQuery = BodyItem | BodyItem[]

const arrayInputSchema: JSONSchema7 = {
  type: "array",
  minItems: 1,
  maxItems: 100,
  items: singularItemInputSchema,
}

export const bodyInputSchema: JSONSchema7 = {
  oneOf: [singularItemInputSchema, arrayInputSchema],
}

export const bodyHandler = async (
  input: BodyQuery,
): Promise<BodyQuery extends undefined[] ? Array<Relation | null> : Relation> => {
  if (!Array.isArray(input)) {
    const relation = await knex
      .select(["anidb", "anilist", "myanimelist", "kitsu"])
      .where(input)
      .from("relations")
      .first()

    // eslint-disable-next-line ts/no-unsafe-return
    return relation ?? null!
  }

  let relations: Array<Relation | null> = []

  // Get relations
  relations = await knex
    .select(["anidb", "anilist", "myanimelist", "kitsu"])
    .where(function() {
      // eslint-disable-next-line ts/no-floating-promises
      for (const item of input) this.orWhere(item)
    })
    .from("relations")

  // Map them against the input, so we get results like [{item}, null, {item}]
  relations = input.map((item) => {
    const realItem = Object.entries(item)[0] as [Source, number]

    return relations.find((relation) => relation![realItem[0]] === realItem[1]) ?? null
  })

  return relations as never
}
