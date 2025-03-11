import * as v from "valibot"

export enum Environment {
	Development = "development",
	Test = "test",
	Production = "production",
}

const schema = v.object({
	NODE_ENV: v.optional(v.enum(Environment), Environment.Development),
	PORT: v.optional(v.pipe(v.string(), v.transform(Number), v.integer()), "3000"),
	LOG_LEVEL: v.optional(
		v.picklist(["fatal", "error", "warn", "info", "debug", "trace"]),
		process.env.NODE_ENV === "development" ? "debug" : "info",
	),
	USER_AGENT: v.optional(v.string(), "arm-server"),
})

const result = v.safeParse(schema, process.env)

if (!result.success) {
	console.error(
		"❌ Invalid environment variables:",
		JSON.stringify(result.issues, null, 4),
	)

	process.exit(1)
}

export const config = result.output
