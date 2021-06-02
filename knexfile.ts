export const config: import('knex').Knex.Config = {
  client: 'sqlite3',
  migrations: {
    tableName: 'migrations',
    directory: 'migrations',
  },
  useNullAsDefault: true,
  connection: {
    filename: `./sqlite/${process.env.NODE_ENV ?? 'development'}.sqlite3`,
  },
}

export default config
