import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

const getEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }

  return "";
};

export const hasMysqlConfig = () =>
  Boolean(
      getEnv("MYSQL_HOST", "DB_HOST") &&
      getEnv("MYSQL_DATABASE", "MYSQL_DB", "DB_NAME") &&
      getEnv("MYSQL_USER", "DB_USER") &&
      getEnv("MYSQL_PASSWORD", "DB_PASSWORD"),
  );

export const getMysqlPool = () => {
  if (pool) return pool;

  pool = mysql.createPool({
    host: getEnv("MYSQL_HOST", "DB_HOST"),
    port: Number(getEnv("MYSQL_PORT", "DB_PORT") || 3306),
    database: getEnv("MYSQL_DATABASE", "MYSQL_DB", "DB_NAME"),
    user: getEnv("MYSQL_USER", "DB_USER"),
    password: getEnv("MYSQL_PASSWORD", "DB_PASSWORD"),
    waitForConnections: true,
    connectionLimit: Number(getEnv("MYSQL_CONNECTION_LIMIT") || 5),
    namedPlaceholders: true,
  });

  return pool;
};
