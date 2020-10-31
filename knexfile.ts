import { readFileSync } from 'fs'

enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

// This export is overridden by the module.exports at the end,
// but is required for TS to recognize it as a module
export const config: Record<Environment, import('knex').Config> = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './sqlite/dev.sqlite3',
    },
    migrations: {
      tableName: 'migrations',
      directory: 'migrations',
    },
    useNullAsDefault: true,
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: './sqlite/tests.sqlite3',
    },
    migrations: {
      tableName: 'migrations',
      directory: 'migrations',
    },
    useNullAsDefault: true,
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        ca: readFileSync(process.env.DATABASE_CERT!).toString(),
      },
    },
    migrations: {
      tableName: 'migrations',
      directory: 'migrations',
    },
    useNullAsDefault: true,
  },
}

module.exports = {
  ...config,
  config,
}
