export default {
  client: "better-sqlite3",
  migrations: {
    tableName: "migrations",
    directory: "migrations",
  },
  useNullAsDefault: true,
  connection: {
    filename: `./sqlite/${process.env.NODE_ENV ?? "development"}.sqlite3`,
  },
} satisfies import("knex").Knex.Config
