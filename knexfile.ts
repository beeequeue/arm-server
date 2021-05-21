const defaultConfig = {
  useNullAsDefault: true,
}

// This export is overridden by the module.exports at the end,
// but is required for TS to recognize it as a module
export const config = {
  test: {
    ...defaultConfig,
    client: "sqlite3",
    connection: {
      filename: "./sqlite/tests.sqlite3",
    },
  },

  development: {
    ...defaultConfig,
    client: "pg",
    connection: process.env.DATABASE_URL,
  },

  production: {
    ...defaultConfig,
    client: "pg",
    connection: process.env.DATABASE_URL,
  },
}

module.exports = {
  ...config,
  config,
}
