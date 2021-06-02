/* eslint-disable @typescript-eslint/no-explicit-any */

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
