import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "../db/schema.sql");

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST ?? "localhost",
  port: toNumber(process.env.MYSQL_PORT, 3306),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  multipleStatements: true,
  charset: "utf8mb4",
});

try {
  const schema = await fs.readFile(schemaPath, "utf8");
  await connection.query(schema);
  console.log("MySQL schema initialized.");
} finally {
  await connection.end();
}
