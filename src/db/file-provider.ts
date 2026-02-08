import { readdirSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import type { Migration, MigrationProvider } from "kysely"

const isMigration = (obj: unknown): obj is Migration =>
	typeof (obj as { up?: unknown })?.up === "function"

/**
 * Reads all migrations from a folder in node.js.
 *
 * ```ts
 * new FileMigrationProvider("path/to/migrations/folder")
 * ```
 */
export class ActuallyWorkingMigrationProvider implements MigrationProvider {
	readonly #migrationDirPath: string

	constructor(migrationDirPath: string) {
		this.#migrationDirPath = migrationDirPath
	}

	async getMigrations(): Promise<Record<string, Migration>> {
		const migrations: Record<string, Migration> = {}
		const files = readdirSync(this.#migrationDirPath)

		for (const fileName of files) {
			if (
				fileName.endsWith(".js") ||
				(fileName.endsWith(".ts") && !fileName.endsWith(".d.ts")) ||
				fileName.endsWith(".mjs") ||
				(fileName.endsWith(".mts") && !fileName.endsWith(".d.mts"))
			) {
				const filePath = pathToFileURL(path.join(this.#migrationDirPath, fileName)).toString()
				const migration = (await import(filePath)) as Migration | { default?: Migration }
				const migrationKey = fileName.substring(0, fileName.lastIndexOf("."))

				// Handle esModuleInterop export's `default` prop...
				if (isMigration((migration as { default?: Migration })?.default)) {
					migrations[migrationKey] = (migration as { default?: Migration }).default!
				} else if (isMigration(migration)) {
					migrations[migrationKey] = migration
				}
			}
		}

		return migrations
	}
}
