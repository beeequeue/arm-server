import * as v from "valibot"

export const oldSourceSchema = v.picklist(
	["anilist", "anidb", "myanimelist", "kitsu"],
	"Invalid source",
)

export const numberIdSchema = v.pipe(
	v.unknown(),
	v.transform(Number),
	v.integer("Invalid ID"),
	v.minValue(1),
	v.maxValue(50_000_000),
)

export const stringIdSchema = v.pipe(v.string("Invalid ID"), v.minLength(1), v.maxLength(150))

export const imdbIdSchema = v.pipe(
	v.string("Invalid IMDB ID"),
	v.startsWith("tt"),
	v.minLength(3),
	v.maxLength(50),
	v.transform((input): `tt${string}` => input as `tt${string}`),
)
