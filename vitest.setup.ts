import { migrator } from "./src/db.ts"

await migrator.migrateToLatest()
