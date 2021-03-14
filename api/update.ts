import { forbidden, internal } from "@hapi/boom"

import { ArmData } from "./_arm"
import { createHandler, CustomHandler } from "./_base"

const { CHECK_TOKEN } = process.env

const handler: CustomHandler = async (request) => {
  if (CHECK_TOKEN == null || request.headers.authorization !== `Bearer ${CHECK_TOKEN}`) {
    return forbidden()
  }

  try {
    await ArmData.updateDatabase()
  } catch (err) {
    return internal(err.message, err)
  }
}

export default createHandler("/update", handler)
