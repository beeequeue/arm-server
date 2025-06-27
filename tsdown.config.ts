import { defineConfig } from "tsdown"

import pkgJson from "./package.json" with { type: "json" }

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",

	sourcemap: true,
	minify: true,

	env: {
		NODE_ENV: process.env.NODE_ENV ?? "production",
		DEV: process.env.NODE_ENV === "development",
		PROD: process.env.NODE_ENV === "production",
		TEST: false,
		HOMEPAGE: pkgJson.homepage,
	},

	shims: true,
	platform: "node",
	target: ["node24"],
	format: ["esm"],
	fixedExtension: true,
})
