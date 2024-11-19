import type { Context } from "hono"
import type { HTTPException } from "hono/http-exception"
import type { StatusCode } from "hono/utils/http-status"
import type { TypeOf, z, ZodError } from "zod"

type ErrorJson = {
	code?: string
	statusCode: number
	error: string
	message?: string
}

const getErrorText = (code: StatusCode) => {
	switch (code) {
		case 400:
			return "Bad Request"
		case 401:
			return "Unauthorized"
		case 403:
			return "Forbidden"
		case 404:
			return "Not Found"
		case 405:
			return "Method Not Allowed"
		case 406:
			return "Not Acceptable"
		case 408:
			return "Request Timeout"
		case 409:
			return "Conflict"
		case 410:
			return "Gone"
		case 411:
			return "Length Required"
		case 412:
			return "Precondition Failed"
		case 413:
			return "Payload Too Large"
		case 414:
			return "URI Too Long"
		case 415:
			return "Unsupported Media Type"
		case 416:
			return "Range Not Satisfiable"
		case 417:
			return "Expectation Failed"
		case 418:
			return "I'm a teapot"
		case 421:
			return "Misdirected Request"
		case 422:
			return "Unprocessable Entity"
		case 423:
			return "Locked"
		case 424:
			return "Failed Dependency"
		case 425:
			return "Too Early"
		case 426:
			return "Upgrade Required"
		case 428:
			return "Precondition Required"
		case 429:
			return "Too Many Requests"
		case 431:
			return "Request Header Fields Too Large"
		case 451:
			return "Unavailable For Legal Reasons"
		case 500:
			return "Internal Server Error"
		case 501:
			return "Not Implemented"
		case 502:
			return "Bad Gateway"
		case 503:
			return "Service Unavailable"
		case 504:
			return "Gateway Timeout"
		case 505:
			return "HTTP Version Not Supported"
		case 506:
			return "Variant Also Negotiates"
		case 507:
			return "Insufficient Storage"
		case 508:
			return "Loop Detected"
		case 510:
			return "Not Extended"
		case 511:
			return "Network Authentication Required"
		default:
			return "Error"
	}
}

export const createErrorJson = (
	c: Context,
	input: Pick<HTTPException, "status" | "message"> & { code?: string },
) => {
	const status: StatusCode = input.status
	const body: Omit<ErrorJson, "error" | "statusCode"> = {
		message: input.message ?? "An error occurred.",
	}

	if (input.code != null) {
		body.code = input.code
	}

	c.status(status)
	return c.json({
		...body,
		statusCode: status,
		error: getErrorText(status),
	})
}

export const zHook = <T extends z.ZodType<any, z.ZodTypeDef, any>>(
	result: TypeOf<T>,
	c: Context,
) => {
	if (result.success === true) return

	const flat = (result.error as ZodError).flatten()
	const messages = [
		...flat.formErrors,
		...Object.entries(flat.fieldErrors).map(
			([key, value]) => `${key}: ${value?.join(", ") ?? "error"}`,
		),
	]

	return createErrorJson(c, {
		status: 400,
		message: messages.join(", "),
		code: "FST_ERR_VALIDATION",
	})
}

export enum CacheTimes {
	HOUR = 3600,
	SIX_HOURS = 21_600,
	DAY = 86_400,
	WEEK = 1_209_600,
}

export const cacheReply = (response: Response, value: CacheTimes | number | string) => {
	response.headers.set("Cache-Control", `public, max-age=${value.toString()}`)

	return response
}
