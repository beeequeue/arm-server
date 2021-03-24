import type { Environment } from './src/config'

const defaultConfig = {
  client: 'sqlite3',
  migrations: {
    tableName: 'migrations',
    directory: 'migrations',
  },
  useNullAsDefault: true,
}

// This export is overridden by the module.exports at the end,
// but is required for TS to recognize it as a module
export const config: Record<Environment, import('knex').Config> = {
  development: {
    ...defaultConfig,
    connection: {
      filename: './sqlite/dev.sqlite3',
    },
  },

  test: {
    ...defaultConfig,
    connection: {
      filename: './sqlite/tests.sqlite3',
    },
  },

  production: {
    ...defaultConfig,
    connection: {
      filename: './sqlite/prod.sqlite3',
    },
  },
}

module.exports = {
  ...config,
  config,
}
