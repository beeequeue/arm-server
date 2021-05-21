import Joi from "joi"

import { Source } from "../_types"

export const sourceArray = Object.values(Source)

export const idSchema = Joi.number().min(0).max(2147483647).integer().required()
