import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "PROMESA Administrator" } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("DATABASE_URL, ADMIN_EMAIL, and ADMIN_PASSWORD must be set before seeding the administrator.");
}

const sql = neon(DATABASE_URL);
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await sql`INSERT INTO users (name, email, password_hash, role)
  VALUES (${ADMIN_NAME}, ${ADMIN_EMAIL.toLowerCase()}, ${passwordHash}, 'admin')
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'admin';`;
console.log(`Administrator account ready: ${ADMIN_EMAIL.toLowerCase()}`);
