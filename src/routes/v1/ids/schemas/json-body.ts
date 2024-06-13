import { z } from "zod"
import type { Source } from "@/db"
import { numberIdSchema, oldSourceSchema } from "@/shared-schemas"

export const singularItemInputSchema = z.record(oldSourceSchema, numberIdSchema)

const arrayInputSchema = z.array(singularItemInputSchema)

export const bodyInputSchema = z.union([singularItemInputSchema, arrayInputSchema])

type BodyItem = {
  [key in Source]?: number
}

export type BodyQuery = BodyItem | BodyItem[]
