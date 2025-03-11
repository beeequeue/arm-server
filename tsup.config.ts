import { cpSync } from "node:fs"

import { defineConfig } from "tsup"

import pkgJson from "./package.json" with { type: "json" }

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
		HOMEPAGE: JSON.stringify(pkgJson.homepage),
	},

	shims: true,
	target: "node22",
	format: ["esm"],
	banner: {
		js: "import {createRequire} from 'module';const require=createRequire(import.meta.url);",
	},
	esbuildOptions: (options) => {
		options.supported = {
			// For better performance: https://github.com/evanw/esbuild/issues/951
			"object-rest-spread": false,
		}
	},
	esbuildPlugins: [
		{
			name: "better-sqlite3-copy",
			setup({ onEnd }) {
				onEnd(() => {
					cpSync(
						"node_modules/better-sqlite3/build/Release/better_sqlite3.node",
						"dist/better_sqlite3.node",
						{ recursive: true },
					)
				})
			},
		},
	],
})
