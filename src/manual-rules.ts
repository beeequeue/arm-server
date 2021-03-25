import { knex, Relation } from './db'
import { Logger } from './lib/logger'

const rules = {
  // Kaguya-sama
  'anidb:14111': 'anilist:101921',
  // Shield Hero
  'anidb:13246': 'anilist:99263',
}

export const updateBasedOnManualRules = async () => {
  const promises = Object.entries(rules).map(async ([from, to]) => {
    const [fromSource, fromId] = from.split(':')
    const fromWhere = { [fromSource]: Number(fromId) }
    const [toSource, toId] = to.split(':')
    const toWhere = { [toSource]: Number(toId) }

    const badRelation: Relation | null = await knex('relations')
      .where(fromWhere)
      .first()

    if (!badRelation) {
      throw new Error(`Could not find rule source for ${from}->${to}!!!!!`)
    }

    await knex
      .transaction((trx) =>
        knex('relations')
          .delete()
          .where(fromWhere)
          .transacting(trx)
          .then(() =>
            knex('relations').update(fromWhere).where(toWhere).transacting(trx),
          ),
      )
      .catch(Logger.error)
  })

  await Promise.all(promises)
}
