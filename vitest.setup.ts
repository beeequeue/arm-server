import { migrator } from "./src/db/db.ts"

await migrator.migrateToLatest()
