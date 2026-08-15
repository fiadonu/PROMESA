import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL must be set");

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

const sql = readFileSync(join(__dirname, "..", "drizzle", "0000_initial.sql"), "utf8");

// Split by statements and run each, ignoring "already exists" errors
const statements = sql.split(";").map(s => s.trim()).filter(Boolean);
for (const stmt of statements) {
  try {
    await pool.query(stmt);
    console.log("OK:", stmt.substring(0, 60) + "...");
  } catch (err) {
    if (err.code === "42710" || err.code === "42P07") {
      // 42710 = type already exists, 42P07 = table already exists
      console.log("SKIP (already exists):", stmt.substring(0, 60) + "...");
    } else {
      console.error("ERROR:", err.message);
      console.error("Statement:", stmt);
      process.exit(1);
    }
  }
}
console.log("\nMigration complete!");
await pool.end();
