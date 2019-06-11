enum Environments {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

// This export is overridden by the module.exports at the end,
// but is required for TS to recognize it as a module
export const config = {
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
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'migrations',
      directory: 'migrations',
    },
    useNullAsDefault: true,
  },
} as { [key in Environments]: import('knex').Config }

module.exports = {
  ...config,
  config,
}
