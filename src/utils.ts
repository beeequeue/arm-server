/* eslint-disable @typescript-eslint/no-explicit-any */

import { Response } from 'superagent'

export type RequestSuccess<B extends Record<string, unknown>> = {
  status: 200
  ok: true
  body: B
} & Response

export type RequestError<B extends Record<string, unknown>> = {
  status: 200 | 400 | 401 | 404 | 500 | 502 | 429
  ok: false
  body: B
} & Response

export type RequestResponse<
  D extends Record<string, unknown> = any,
  E extends Record<string, unknown> = any
> = RequestSuccess<D> | RequestError<E>

export const responseIsError = (
  res: RequestResponse | null,
): res is RequestError<any> | null => res == null || !res.ok || !!res.error

export const enumToArray = <E>(e: E): E[] => Object.values(e)

export const isEmpty = <
  T extends Record<string, unknown> | Record<string, unknown>[]
>(
  obj: T,
) => {
  if (Array.isArray(obj)) {
    return obj.length < 1
  }

  return Object.keys(obj).length < 1
}
