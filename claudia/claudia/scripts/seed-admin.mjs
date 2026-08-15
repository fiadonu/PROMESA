import bcrypt from "bcryptjs";
import pg from "pg";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "PROMESA Administrator" } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("DATABASE_URL, ADMIN_EMAIL, and ADMIN_PASSWORD must be set before seeding the administrator.");
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await pool.query(
  `INSERT INTO users (name, email, password_hash, role)
   VALUES ($1, $2, $3, 'admin')
   ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'admin';`,
  [ADMIN_NAME, ADMIN_EMAIL.toLowerCase(), passwordHash]
);
console.log(`Administrator account ready: ${ADMIN_EMAIL.toLowerCase()}`);
await pool.end();
