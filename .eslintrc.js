module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:@beequeue/base",
    "plugin:@beequeue/vue",
    "plugin:@beequeue/typescript",
    "plugin:@beequeue/prettier",
  ],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
  },
}
