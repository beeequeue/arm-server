import { defineConfig } from "tsdown"

import pkgJson from "./package.json" with { type: "json" }

export default defineConfig({
	entry: ["src/index.ts", "src/migrations/*.ts"],
	outDir: "dist",
	inlineOnly: false,

	env: {
		NODE_ENV: process.env.NODE_ENV ?? "production",
		DEV: process.env.NODE_ENV === "development",
		PROD: process.env.NODE_ENV === "production",
		TEST: false,
		HOMEPAGE: pkgJson.homepage,
	},

	minify: true,
	sourcemap: true,
	platform: "node",
	target: ["node25"],
	format: ["esm"],
	fixedExtension: true,
})
