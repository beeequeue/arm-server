import { captureMessage } from "@sentry/node"

import { Logger } from "./_logger"
import { Relation } from "./_types"

const rules = {
  // Kaguya-sama
  "anidb:14111": "anilist:101921",
  // Shield Hero
  "anidb:13246": "anilist:99263",
  // Vivy #385
  "anidb:15988": "myanimelist:46095",
  // Osananajimi #386
  "anidb:15756": "myanimelist:43007",
  // Iruma-kun S2 #387
  "anidb:15428": "myanimelist:41402",
}

const parseRule = (rule: string) => {
  const [source, id] = rule.split(":") as [keyof Relation, string]

  return [source, Number(id)] as const
}

export const updateBasedOnManualRules = (relations: Relation[]) => {
  const newRelations = [...relations]

  Object.entries(rules).forEach(([from, to]) => {
    const [fromSource, fromId] = parseRule(from)
    const [toSource, toId] = parseRule(to)

    const fromIndex = relations.findIndex((relation) => relation[fromSource] === fromId)
    if (fromIndex < 0) {
      const msg = `Could not find rule source for "${from} -> ${to}"!`
      Logger.warn(msg)
      captureMessage(msg)

      return
    }

    if (relations[fromIndex][toSource] != null) {
      const msg = `Manual rule "${from} -> ${to}" is redundant!`
      Logger.warn(msg)
      captureMessage(msg)

      return
    }

    const toIndex = relations.findIndex((relation) => relation[toSource] === toId)
    const toRelation = relations[toIndex]

    // Remove the old one from the new array
    newRelations.splice(toIndex, 1)
    // Update the correct entry with the new data
    newRelations[fromIndex] = {
      anilist: toRelation.anilist ?? newRelations[fromIndex].anilist,
      anidb: toRelation.anidb ?? newRelations[fromIndex].anidb,
      kitsu: toRelation.kitsu ?? newRelations[fromIndex].kitsu,
      myanimelist: toRelation.myanimelist ?? newRelations[fromIndex].myanimelist,
    }
  })

  return newRelations
}
