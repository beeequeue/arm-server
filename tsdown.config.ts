import { defineConfig } from "tsdown"

import pkgJson from "./package.json" with { type: "json" }

const isProd = process.env.NODE_ENV === "production"

export default defineConfig({
	entry: ["src/index.ts", "src/migrations/*.ts"],
	outDir: "dist",

	sourcemap: isProd,
	minify: isProd ? true : "dce-only",

	env: {
		NODE_ENV: process.env.NODE_ENV ?? "production",
		DEV: process.env.NODE_ENV === "development",
		PROD: isProd,
		TEST: false,
		HOMEPAGE: pkgJson.homepage,
	},

	shims: true,
	platform: "node",
	target: ["node24"],
	format: ["esm"],
	fixedExtension: true,
})
