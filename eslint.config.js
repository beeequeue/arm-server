import antfu from "@antfu/eslint-config"

const sortImports = {
	"perfectionist/sort-imports": [
		"error",
		{
			type: "natural",
			internalPattern: ["^@/", "^~/", "^#[a-zA-Z0-9-]+/"],
			newlinesBetween: "always",
			groups: [
				["builtin", "builtin-type"],
				["external", "external-type"],
				["internal", "internal-type"],
				["parent", "parent-type"],
				["sibling", "sibling-type"],
				["index", "index-type"],
				"object",
				"unknown",
			],
		},
	],
}

export default antfu({
	ignores: ["**/*.json"],
	markdown: false,
	stylistic: false,
	jsonc: false,
	jsx: false,
	toml: false,
	typescript: {
		tsconfigPath: "tsconfig.json",

		overrides: {
			"no-console": "off",
			"antfu/no-top-level-await": "off",
			"import/consistent-type-specifier-style": ["error", "prefer-top-level"],
			"ts/consistent-type-imports": [
				"error",
				{ fixStyle: "inline-type-imports", disallowTypeAnnotations: false },
			],
			"node/prefer-global/process": "off",
			"ts/consistent-type-definitions": "off",
			"ts/no-use-before-define": "off",
			"unused-imports/no-unused-vars": "off",

			...sortImports,
		},
	},
})
