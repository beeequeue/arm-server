module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:@beequeue/base',
    'plugin:@beequeue/node',
    'plugin:@beequeue/typescript',
    'plugin:@beequeue/prettier',
  ],
  rules: {
    'prettier/prettier': 'off',
    'import/no-named-as-default-member': 'off',
  },
  overrides: [
    {
      files: ['!pages/**/*.tsx', '**/*.stories.tsx'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
}
