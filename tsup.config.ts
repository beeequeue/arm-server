import process from "node:process"

import { defineConfig } from "tsup"

export default defineConfig({
	entry: ["src/index.ts"],
	external: ["sqlite3"],
	outDir: "dist",

	bundle: true,
	sourcemap: false,
	clean: true,
	minify: true,

	env: {
		NODE_ENV: process.env.NODE_ENV ?? "production",
		DEV: (process.env.NODE_ENV === "development") as unknown as string,
		PROD: (process.env.NODE_ENV === "production") as unknown as string,
		TEST: false as unknown as string,
	},

	target: "node22",
	format: ["esm"],
	banner: { js: "const require = createRequire(import.meta.url);" },
	esbuildOptions: (options) => {
		options.supported = {
			// For better performance: https://github.com/evanw/esbuild/issues/951
			"object-rest-spread": false,
		}
	},
})
