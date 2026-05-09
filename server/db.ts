import { createPool, type PoolOptions, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

type SqlParam = string | number | bigint | boolean | Date | null | Buffer | Uint8Array;

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getPoolConfig = (): PoolOptions | string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  return {
    host: process.env.MYSQL_HOST ?? "localhost",
    port: toNumber(process.env.MYSQL_PORT, 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "aingthons",
    waitForConnections: true,
    connectionLimit: toNumber(process.env.MYSQL_CONNECTION_LIMIT, 10),
    charset: "utf8mb4",
    dateStrings: true,
  };
};

const poolConfig = getPoolConfig();

export const pool = typeof poolConfig === "string"
  ? createPool(poolConfig)
  : createPool(poolConfig);

export async function selectRows<T extends RowDataPacket[]>(
  sql: string,
  params: SqlParam[] = [],
) {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}

export async function executeQuery(sql: string, params: SqlParam[] = []) {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}
