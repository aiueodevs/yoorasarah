import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  postgresClient?: postgres.Sql;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

export const postgresClient = globalForDb.postgresClient ?? postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  prepare: false
});

export const db = globalForDb.db ?? drizzle(postgresClient, { schema });

if (Bun.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = postgresClient;
  globalForDb.db = db;
}
