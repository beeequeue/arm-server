/* eslint-disable ts/consistent-type-imports */

import type { Connector, Database, Primitive } from "db0"
import {
	type CompiledQuery,
	type DatabaseConnection,
	type DatabaseIntrospector,
	type Dialect,
	type Driver,
	type Kysely,
	type QueryCompiler,
	type QueryResult,
	SqliteAdapter,
	SqliteIntrospector,
	SqliteQueryCompiler,
} from "kysely"

type SqliteDatabase = import("node:sqlite").DatabaseSync
// | import("better-sqlite3").DatabaseSync
// | import("sqlite3").DatabaseSync
// | import("@cloudflare/workers-types/latest").D1Database

/**
 * todo docs
 */
export class Db0SqliteDialect implements Dialect {
	#db: Database<Connector<SqliteDatabase>>

	constructor(db: Database<Connector<SqliteDatabase>>) {
		this.#db = db
	}

	createAdapter() {
		return new SqliteAdapter()
	}

	createDriver(): Driver {
		return new Db0SqliteDriver(this.#db)
	}

	createQueryCompiler(): QueryCompiler {
		return new SqliteQueryCompiler()
	}

	createIntrospector(db: Kysely<any>): DatabaseIntrospector {
		return new SqliteIntrospector(db)
	}
}

class Db0SqliteDriver implements Driver {
	#db: Database<Connector<SqliteDatabase>>

	constructor(db: Database<Connector<SqliteDatabase>>) {
		this.#db = db
	}

	async init(): Promise<void> {}

	async acquireConnection(): Promise<DatabaseConnection> {
		return new Db0SqliteConnection(this.#db)
	}

	async beginTransaction(conn: Db0SqliteConnection): Promise<void> {
		return conn.beginTransaction()
	}

	async commitTransaction(conn: Db0SqliteConnection): Promise<void> {
		return conn.commitTransaction()
	}

	async rollbackTransaction(conn: Db0SqliteConnection): Promise<void> {
		return conn.rollbackTransaction()
	}

	async releaseConnection(_conn: Db0SqliteConnection): Promise<void> {}

	async destroy(): Promise<void> {
		const instance = await this.#db.getInstance()

		// eslint-disable-next-line ts/no-unsafe-member-access
		if (typeof (instance as any).close === "function") {
			return (instance as never as { close: () => Promise<void> }).close()
		}
		// eslint-disable-next-line ts/no-unsafe-member-access
		if (typeof (instance as any).destroy === "function") {
			return (instance as never as { destroy: () => Promise<void> }).destroy()
		}
	}
}

class Db0SqliteConnection implements DatabaseConnection {
	#db: Database<Connector<SqliteDatabase>>

	// TODO: transactions?

	constructor(db: Database<Connector<SqliteDatabase>>) {
		if (db.dialect !== "sqlite") {
			throw new Error("db0 driver only supports sqlite dialects for now.")
		}

		this.#db = db
	}

	async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
		// Transactions are not supported yet.
		// if (this.#transactionClient) return this.#transactionClient.executeQuery(compiledQuery)

		const results = await this.#db
			.prepare(compiledQuery.sql)
			.bind(...(compiledQuery.parameters as Primitive[]))
			.all()
			.then((data) => ({ data, error: null }))
			.catch((error: Error) => ({ data: null, error }))
		if (results.error) {
			console.dir(results.error)
			throw new Error("Failed to execute query", { cause: results.error })
		}

		const numAffectedRows =
			results.data.length > 0 ? BigInt(results.data.length) : undefined

		return {
			// insertId:
			//   results.meta.last_row_id === undefined || results.meta.last_row_id === null
			//     ? undefined
			//     : BigInt(results.meta.last_row_id),
			rows: (results.data as O[]) ?? [],
			numAffectedRows,
		}
	}

	async beginTransaction() {
		// this.#transactionClient = this.#transactionClient ?? new PlanetScaleConnection(this.#config)
		// this.#transactionClient.#conn.execute('BEGIN')
		throw new Error("db0 driver does not support transactions yet.")
	}

	async commitTransaction() {
		// if (!this.#transactionClient) throw new Error('No transaction to commit')
		// this.#transactionClient.#conn.execute('COMMIT')
		// this.#transactionClient = undefined
		throw new Error("db0 driver does not support transactions yet.")
	}

	async rollbackTransaction() {
		// if (!this.#transactionClient) throw new Error('No transaction to rollback')
		// this.#transactionClient.#conn.execute('ROLLBACK')
		// this.#transactionClient = undefined
		throw new Error("db0 driver does not support transactions yet.")
	}

	async *streamQuery<O>(
		_compiledQuery: CompiledQuery,
		_chunkSize: number,
	): AsyncIterableIterator<QueryResult<O>> {
		throw new Error("db0 driver does not support streaming (yet?)")
	}
}
