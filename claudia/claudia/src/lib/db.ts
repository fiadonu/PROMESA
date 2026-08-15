import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  : null;
export const db = pool ? drizzle({ client: pool, schema }) : null;
export function requireDb() {
  if (!db)
    throw new Error(
      "DATABASE_URL is not configured. Add it to .env.local before using database features.",
    );
  return db;
}
