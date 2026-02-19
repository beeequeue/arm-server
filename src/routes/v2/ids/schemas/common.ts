import * as v from "valibot"

// Does not include `thetvdb` due to the one-to-many issue
export const numberIdSourceSchema = v.picklist([
	"anilist",
	"anidb",
	"animecountdown",
	"animenewsnetwork",
	"anisearch",
	"kitsu",
	"livechart",
	"myanimelist",
])

export const stringIdSourceSchema = v.picklist(["anime-planet", "notify-moe"])
