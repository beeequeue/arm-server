import { z } from "zod"

import type { Relation } from "../../../../db.js"
import {
	imdbIdSchema,
	numberIdSchema,
	stringIdSchema,
} from "../../../../shared-schemas.js"

// Does not include `thetvdb` due to the one-to-many issue
type BodyItem = Omit<Relation, "thetvdb">

export const singularItemInputSchema = z
	.object({
		anidb: numberIdSchema,
		anilist: numberIdSchema,
		"anime-planet": stringIdSchema,
		anisearch: numberIdSchema,
		imdb: imdbIdSchema,
		kitsu: numberIdSchema,
		livechart: numberIdSchema,
		"notify-moe": stringIdSchema,
		myanimelist: numberIdSchema,
	})
	.partial()
	.strict()
	.refine((value) => Object.values(value).some((id) => id != null), {
		message: "At least one ID must be provided",
	})

export type BodyQuery = BodyItem | BodyItem[]

const arrayInputSchema = z.array(singularItemInputSchema).min(1).max(100)

export const bodyInputSchema = z.union([singularItemInputSchema, arrayInputSchema])
