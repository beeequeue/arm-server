import { Response } from 'superagent'

export interface RequestSuccess<B extends object> extends Response {
  status: 200
  ok: true
  body: B
}

export interface RequestError<B extends object> extends Response {
  status: 200 | 400 | 401 | 404 | 500 | 502 | 429
  ok: false
  body: B
}

export type RequestResponse<D extends object = any, E extends object = any> =
  | RequestSuccess<D>
  | RequestError<E>

export const responseIsError = (
  res: RequestResponse | null
): res is RequestError<any> | null =>
  res == null || !res.ok || !!res.error

export const enumToArray = <E>(Enum: E): E[] => Object.values(Enum)
