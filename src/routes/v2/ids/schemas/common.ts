import type { JSONSchema7 } from "json-schema"

// Does not include `thetvdb` due to the one-to-many issue
export const numberIdSourceSchema: JSONSchema7 = {
  type: "string",
  enum: [
    "anilist",
    "anidb",
    "anisearch",
    "kitsu",
    "livechart",
    "themoviedb",
    "myanimelist",
  ],
}

export const stringIdSourceSchema: JSONSchema7 = {
  type: "string",
  enum: ["anime-planet", "notify-moe"],
}

export const imdbSourceSchema: JSONSchema7 = {
  type: "string",
  const: "imdb",
}
