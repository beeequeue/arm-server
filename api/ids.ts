import { badRequest } from "@hapi/boom"

import { ARMData } from "./_arm"
import { createHandler } from "./_base"
import { Logger } from "./_logger"
import { BodyInput, bodySchema } from "./handlers/_json-body"
import { QueryParamInput, querySchema } from "./handlers/_query-params"

const isEmpty = <T extends Record<string, unknown> | Record<string, unknown>[]>(obj: T) => {
  if (Array.isArray(obj)) {
    return obj.length < 1
  }

  return Object.keys(obj).length < 1
}

const data = new ARMData()

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
})
