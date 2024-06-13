import Fastify from "fastify"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"

import { includeSchema } from "./include"
import { Source, knex } from "@/db"

const app = Fastify()
const handlerFn = vi.fn(() => ({ message: "ok" }))
app.get("/test", { schema: { querystring: includeSchema } }, handlerFn)

beforeEach(async () => {
  await knex.delete().from("relations")
})

afterAll(async () => {
  await Promise.all([knex.destroy(), app.close()])
})

describe("schema", () => {
  it("single source (anilist)", async () => {
    const response = await app.inject().get("/test").query({
      include: Source.AniList,
    })

    expect(response.json()).toStrictEqual({ message: "ok" })
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })

  it("multiple sources (anilist,thetvdb)", async () => {
    const response = await app
      .inject()
      .get("/test")
      .query({
        include: [Source.AniList, Source.TheTVDB].join(","),
      })

    expect(response.json()).toStrictEqual({ message: "ok" })
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })

  it("all the sources", async () => {
    const response = await app
      .inject()
      .get("/test")
      .query({
        include: Object.values(Source).join(","),
      })

    expect(response.json()).toStrictEqual({ message: "ok" })
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("application/json")
  })
})
