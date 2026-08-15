import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
export const db = databaseUrl
  ? drizzle({ client: neon(databaseUrl), schema })
  : null;
export function requireDb() {
  if (!db)
    throw new Error(
      "DATABASE_URL is not configured. Add it to .env.local before using database features.",
    );
  return db;
}
