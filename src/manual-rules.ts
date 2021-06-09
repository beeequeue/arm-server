import { knex, Relation } from "./db"

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

export const updateBasedOnManualRules = async () => {
  const promises = Object.entries(rules).map(async ([from, to]) => {
    const [fromSource, fromId] = from.split(":")
    const fromWhere = { [fromSource]: Number(fromId) }
    const [toSource, toId] = to.split(":")
    const toWhere = { [toSource]: Number(toId) }

    const badRelation: Relation | null = await knex("relations").where(fromWhere).first()

    if (!badRelation) {
      throw new Error(`Could not find rule source for ${from}->${to}!!!!!`)
    }

    await knex
      .transaction((trx) =>
        knex("relations")
          .delete()
          .where(fromWhere)
          .transacting(trx)
          .then(() =>
            knex("relations").update(fromWhere).where(toWhere).transacting(trx),
          ),
      )
      .catch(console.error)
  })

  await Promise.all(promises)
}
