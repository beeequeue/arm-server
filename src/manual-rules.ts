/* eslint-disable no-console */

import { knex, Relation } from "./db"

type Rule = `${keyof Relation}:${number}`
const rules: Record<Rule, Rule> = {}

export const updateBasedOnManualRules = async () => {
  const promises = Object.entries(rules).map(async ([from, to]) => {
    const [fromSource, fromId] = from.split(":")
    const fromWhere = { [fromSource]: Number(fromId) }
    const [toSource, toId] = (to as string).split(":")
    const toWhere = { [toSource]: Number(toId) }

    const badRelation = await knex("relations").where(fromWhere).first()

    if (!badRelation) {
      throw new Error(`Could not find rule source for ${from}->${to as string}!!!!!`)
    }

    if (badRelation[toSource as keyof Relation] === Number(toId)) {
      return console.warn(
        `${from}:${to as string} has been fixed, can be removed from manual rules.`,
      )
    }

    await knex
      .transaction((trx) =>
        knex("relations")
          .delete()
          .where(fromWhere)
          .transacting(trx)
          .then(() => knex("relations").update(fromWhere).where(toWhere).transacting(trx))
      )
      .catch(console.error)
  })

  await Promise.all(promises)
}
