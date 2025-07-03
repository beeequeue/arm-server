import { db, type Relation } from "./db.ts"

type Rule = `${keyof Relation}:${number}`
const rules: Record<Rule, Rule> = {}

export const updateBasedOnManualRules = async () => {
	const promises = Object.entries(rules).map(async ([from, to]) => {
		const [fromSource, fromId] = from.split(":")
		const fromSourceKey = fromSource as keyof Relation
		const fromIdNum = Number(fromId)

		const [toSource, toId] = (to as string).split(":")
		const toSourceKey = toSource as keyof Relation
		const toIdNum = Number(toId)

		// Find the relation that needs to be fixed
		const badRelation = await db
			.selectFrom("relations")
			.selectAll()
			.where(fromSourceKey, "=", fromIdNum)
			.executeTakeFirst()

		if (!badRelation) {
			throw new Error(`Could not find rule source for ${from}->${to as string}!!!!!`)
		}

		if (badRelation[toSourceKey] === toIdNum) {
			return console.warn(
				`${from}:${to as string} has been fixed, can be removed from manual rules.`,
			)
		}

		try {
			await db.transaction().execute(async (trx) => {
				// Delete the relation with the "from" condition
				await trx.deleteFrom("relations").where(fromSourceKey, "=", fromIdNum).execute()

				// Update the relation with the "to" condition to include the "from" data
				await trx
					.updateTable("relations")
					.set({ [fromSourceKey]: fromIdNum })
					.where(toSourceKey, "=", toIdNum)
					.execute()
			})
		} catch (error) {
			console.error(error)
		}
	})

	await Promise.all(promises)
}
