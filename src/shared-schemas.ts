import { z } from "zod"

export const oldSourceSchema = z.enum(["anilist", "anidb", "myanimelist", "kitsu"], { message: "Invalid source" })

export const numberIdSchema = z.coerce.number({ message: "Invalid ID" }).int().min(0).max(50_000_000).positive()

export const stringIdSchema = z.string({ message: "Invalid ID" }).min(1).max(150)

export const imdbIdSchema = z.string({ message: "Invalid IMDB ID" }).startsWith("tt").min(3).max(50)
