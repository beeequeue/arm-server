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

export type Relation = {
  anilist: number | null
  anidb: number | null
  myanimelist: number | null
  kitsu: number | null
}
