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
} as { [key: string]: import('knex').Config }

module.exports = config
