import "server-only";

import { Pool } from "pg";

const globalForPostgres = globalThis as typeof globalThis & {
  pulsoPgPool?: Pool;
};

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  if (!globalForPostgres.pulsoPgPool) {
    globalForPostgres.pulsoPgPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 3_000,
      application_name: "pulso-civico",
    });
  }
  return globalForPostgres.pulsoPgPool;
}
