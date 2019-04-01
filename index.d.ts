declare module '*/knexfile' {
  interface Config {
    client: 'postgresql' | 'sqlite3'
    connection: {
      database?: string
      user?: string
      password?: string
    }
    pool?: {
      min?: number
      max?: number
    }
    migrations?: {
      tableName?: string
    }
  }

  const config: {
    development: Config
    production: Config
  }

  export = config
}
