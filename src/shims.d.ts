declare module "*/knexfile" {
  import { Config } from "knex"

  const config: {
    development: Config
    production: Config
  }

  export = config
}
