export type OfflineDatabaseEntry = {
  sources: string[]
  type: string
  title: string
  picture: string
  relations: string[]
  thumbnail: string
  episodes: number
  synonyms: string[]
}

export type OfflineDatabaseData = {
  data: OfflineDatabaseEntry[]
}

export enum Source {
  AniList = "anilist",
  AniDB = "anidb",
  MAL = "myanimelist",
  Kitsu = "kitsu",
}

export type Relation = {
  [key in Source]: number | null
}

export type QueryParamInput = {
  source: Source
  id: number
}

export type BodyItem = {
  [key in Source]?: number
}

export type BodyInput = BodyItem | BodyItem[]
