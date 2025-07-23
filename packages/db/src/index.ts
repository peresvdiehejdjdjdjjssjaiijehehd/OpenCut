import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { keys } from "./keys";
import * as schema from "./schema";

const { DATABASE_URL } = keys();
// Create a lazy database instance that only initializes when accessed
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
	if (!_db) {
		const client = postgres(DATABASE_URL);
		_db = drizzle(client, { schema });
	}

	return _db;
}

// Export a proxy that forwards all calls to the actual db instance
export const db = getDb();

// Re-export drizzle-orm functions to ensure version consistency
export {
	and,
	eq,
	exists,
	inArray,
	isNotNull,
	isNull,
	not,
	notExists,
	notInArray,
	or,
	sql,
} from "drizzle-orm";
// Re-export schema for convenience
export * from "./schema";
