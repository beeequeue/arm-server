module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:@beequeue/base",
    "plugin:@beequeue/node",
    "plugin:@beequeue/typescript",
    "plugin:@beequeue/prettier",
  ],
  rules: {
    "no-console": "off",
    "import/no-named-as-default": "off",
    "@typescript-eslint/require-await": "off",
  },
}
