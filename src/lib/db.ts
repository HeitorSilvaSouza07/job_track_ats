import { Pool } from "pg";

export type JobRecord = {
  id: string;
  description: string;
  keywords: string[];
  createdAt: Date;
};

export type ResumeRecord = {
  id: string;
  fileName: string;
  originalContent: string;
  optimizedContent: string;
  atsScore: number;
  jobId: string;
  createdAt: Date;
  job?: JobRecord;
};

let pool: Pool | null = null;
let schemaReady = false;

function normalizeDatabaseUrl(databaseUrl?: string) {
  if (!databaseUrl) {
    return undefined;
  }

  try {
    const url = new URL(databaseUrl);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("channel_binding");
    return url.toString();
  } catch {
    return databaseUrl;
  }
}

function getPool() {
  if (!pool) {
    const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required. Configure your Neon PostgreSQL connection string.");
    }

    const shouldUseSsl = Boolean(databaseUrl.includes("neon.tech") || databaseUrl.includes("sslmode="));

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
    });
  }

  return pool;
}

async function ensureSchema() {
  if (schemaReady) {
    return;
  }

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS job (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS resume (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      original_content TEXT NOT NULL,
      optimized_content TEXT NOT NULL DEFAULT '',
      ats_score DOUBLE PRECISION NOT NULL DEFAULT 0,
      job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  schemaReady = true;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  await ensureSchema();
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
