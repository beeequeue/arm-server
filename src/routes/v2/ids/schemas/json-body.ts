import * as v from "valibot"

import type { Relation } from "../../../../db/db.ts"
import { numberIdSchema, stringIdSchema } from "../../../../shared-schemas.ts"

// Does not include `thetvdb` due to the one-to-many issue
type BodyItem = Omit<Relation, "thetvdb">
export const singularItemInputSchema = v.pipe(
	v.partial(
		v.strictObject({
			anidb: numberIdSchema,
			anilist: numberIdSchema,
			"anime-planet": stringIdSchema,
			anisearch: numberIdSchema,
			kitsu: numberIdSchema,
			livechart: numberIdSchema,
			"notify-moe": stringIdSchema,
			myanimelist: numberIdSchema,
		}),
	),
	v.check(
		(value) => Object.values(value).some((id) => id != null),
		"At least one ID must be provided",
	),
)

export type BodyQuery = BodyItem | BodyItem[]

const arrayInputSchema = v.pipe(v.array(singularItemInputSchema), v.minLength(1), v.maxLength(100))

export const bodyInputSchema = v.union([singularItemInputSchema, arrayInputSchema])
