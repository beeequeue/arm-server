import { badRequest } from "@hapi/boom"

import { ArmData } from "./_arm"
import { createHandler } from "./_base"
import { Logger } from "./_logger"
import { BodyInput, BodyItem, QueryParamInput } from "./_types"
import { bodySchema } from "./handlers/_json-body"
import { querySchema } from "./handlers/_query-params"

const isEmpty = <T extends Record<string, unknown>>(obj: T) => {
  return Object.keys(obj).length < 1
}

// Just a type assertion function
const isBodyInput = (_input: QueryParamInput | BodyInput, isBody: boolean): _input is BodyInput =>
  isBody

export default createHandler("/ids", async (request) => {
  const isBodyQuery = isEmpty(request.query)
  const unvalidatedInput = isBodyQuery ? request.body : request.query

  const result = (isBodyQuery ? bodySchema : querySchema).validate(unvalidatedInput, {
    stripUnknown: true,
    abortEarly: false,
  })

  if (result.error) {
    if (!result.error.isJoi) {
      throw result.error
    }

    Logger.debug(result.error.details)
    return badRequest(result.error.message)
  }

  const input = result.value as QueryParamInput | BodyInput

  if (isBodyInput(input, isBodyQuery)) {
    const isArrayInput = Array.isArray(input)
    const bodyInput = isArrayInput ? (input as BodyItem[]) : ([input] as BodyItem[])

    const relations = await ArmData.getRelations(bodyInput)

    return isArrayInput ? relations : relations?.[0] ?? null
  }

  return ArmData.getRelation(input)
})
