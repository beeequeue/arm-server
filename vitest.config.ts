import { defineConfig } from "vitest/config"

export default defineConfig(async ({ command }) => ({
	test: {
		reporters: ["verbose"],

		setupFiles: ["./vitest.setup.ts"],
		poolOptions: {
			forks: { singleFork: true, minForks: 1, maxForks: 1 },
		},

		env: {
			NODE_ENV: "test",
		},

		coverage: {
			enabled: command === "build",
			exclude: ["config.ts"],

			lines: 90,
			functions: 85,
			branches: 85,
			statements: 90,
		},
	},
}))
