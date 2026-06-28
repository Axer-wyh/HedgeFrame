import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = join(root, "prisma", "dev.db");
const migrationsPath = join(root, "prisma", "migrations");

if (existsSync(dbPath)) {
  console.log("Database exists: prisma/dev.db");
  process.exit(0);
}

mkdirSync(dirname(dbPath), { recursive: true });
const sql = readdirSync(migrationsPath)
  .filter((entry) => !entry.startsWith("."))
  .sort()
  .map((entry) => readFileSync(join(migrationsPath, entry, "migration.sql"), "utf8"))
  .join("\n\n");
execFileSync("sqlite3", [dbPath], {
  input: sql,
  stdio: ["pipe", "inherit", "inherit"],
});
console.log("Initialized prisma/dev.db");
