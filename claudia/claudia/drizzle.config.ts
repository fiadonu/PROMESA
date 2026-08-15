// Kept dependency-free so the migration SQL can be applied directly in Neon's SQL editor.
// Install drizzle-kit when automated migration generation is needed.
const config = { schema: "./src/lib/schema.ts", out: "./drizzle", dialect: "postgresql", dbCredentials: { url: process.env.DATABASE_URL! } };
export default config;
