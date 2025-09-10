import type { H3Event, HTTPError } from "h3"
import { type FlatErrors, flatten, type ValiError } from "valibot"

type ErrorJson = {
	code?: string
	statusCode: number
	error: string
	message?: string
}

const getErrorText = (code: number) => {
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

export const createErrorJson = (event: H3Event, input: HTTPError) => {
	const body: Omit<ErrorJson, "error" | "statusCode"> & {
		code?: "FST_ERR_VALIDATION"
		details?: FlatErrors<never>
	} = {
		message: input.message ?? "An error occurred.",
	}

	if (input.status === 400 && "issues" in (input.data as ValiError<never>)) {
		body.code = "FST_ERR_VALIDATION"
		body.message = "Validation error"
		body.details = flatten((input.data as ValiError<never>).issues)
	}

	event.res.status = input.status
	return {
		...body,
		statusCode: input.status,
		error: getErrorText(input.status),
	}
}

export const CacheTimes = {
	HOUR: 3600,
	SIX_HOURS: 21_600,
	DAY: 86_400,
	WEEK: 1_209_600,
} as const
