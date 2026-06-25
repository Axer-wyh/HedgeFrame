import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = join(root, "prisma", "dev.db");
const migrationPath = join(
  root,
  "prisma",
  "migrations",
  "000001_init",
  "migration.sql",
);

if (existsSync(dbPath)) {
  console.log("Database exists: prisma/dev.db");
  process.exit(0);
}

mkdirSync(dirname(dbPath), { recursive: true });
const sql = readFileSync(migrationPath, "utf8");
execFileSync("sqlite3", [dbPath], {
  input: sql,
  stdio: ["pipe", "inherit", "inherit"],
});
console.log("Initialized prisma/dev.db");
