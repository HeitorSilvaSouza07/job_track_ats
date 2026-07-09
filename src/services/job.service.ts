import { randomUUID } from "node:crypto";
import { query, queryOne } from "@/lib/db";
import { DashboardEntry } from "@/types/ats";

export type JobRecord = {
  id: string;
  description: string;
  keywords: string[];
  createdAt: Date;
};

export async function createJob(description: string, keywords: string[]): Promise<JobRecord> {
  const id = randomUUID();
  const rows = await query<JobRecord>(
    `INSERT INTO job (id, description, keywords) VALUES ($1, $2, $3) RETURNING id, description, keywords, created_at AS "createdAt"`,
    [id, description, keywords]
  );

  return rows[0];
}

export async function findJobById(jobId: string): Promise<JobRecord | null> {
  return queryOne<JobRecord>(
    `SELECT id, description, keywords, created_at AS "createdAt" FROM job WHERE id = $1`,
    [jobId]
  );
}

export async function listDashboardEntries(): Promise<DashboardEntry[]> {
  const jobs = await query<JobRecord>(
    `SELECT id, description, keywords, created_at AS "createdAt" FROM job ORDER BY created_at DESC`
  );

  return jobs.map((job) => ({
    id: job.id,
    description: job.description,
    score: 0,
    bestScore: 0,
    resumeCount: 0,
    createdAt: new Date(job.createdAt).toISOString()
  }));
}
