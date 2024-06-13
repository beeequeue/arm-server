import antfu from "@antfu/eslint-config"

export default antfu({
  stylistic: false,
  typescript: {
    tsconfigPath: "tsconfig.json",
    overrides: {
      "no-console": "off",
      "ts/no-use-before-define": "off",
      "ts/consistent-type-definitions": "off",
      "ts/no-unsafe-argument": "off",
      "ts/no-unsafe-assignment": "off",
    },
  },
})
