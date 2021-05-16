import { notFound } from "@hapi/boom"

import { ARMData } from "./_arm"
import { createHandler } from "./_base"
import { Relation } from "./_types"

const data = new ARMData()

export default createHandler("/ids", async (request) => {
  const relation = await data.getRelation(
    request.query.source as keyof Relation,
    Number(request.query.id),
  )

  if (relation == null) {
    return notFound()
  }

  return relation
})
