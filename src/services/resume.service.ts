import { randomUUID } from "node:crypto";
import { query, queryOne } from "@/lib/db";

export type ResumeRecord = {
  id: string;
  fileName: string;
  originalContent: string;
  optimizedContent: string;
  atsScore: number;
  jobId: string;
  createdAt: Date;
  job?: {
    id: string;
    description: string;
    keywords: string[];
  };
};

type CreateResumeInput = {
  fileName: string;
  originalContent: string;
  optimizedContent?: string;
  atsScore: number;
  job: { id: string };
};

type ResumeRow = ResumeRecord & {
  [key: string]: unknown;
};

export async function createResume(input: CreateResumeInput): Promise<ResumeRecord> {
  const id = randomUUID();
  const rows = await query<ResumeRecord>(
    `INSERT INTO resume (id, file_name, original_content, optimized_content, ats_score, job_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, file_name AS "fileName", original_content AS "originalContent", optimized_content AS "optimizedContent", ats_score AS "atsScore", job_id AS "jobId", created_at AS "createdAt"`,
    [id, input.fileName, input.originalContent, input.optimizedContent ?? "", input.atsScore, input.job.id]
  );

  return rows[0];
}

export async function findResumeById(resumeId: string): Promise<ResumeRecord | null> {
  const row = await queryOne<ResumeRow>(
    `SELECT r.id, r.file_name AS "fileName", r.original_content AS "originalContent", r.optimized_content AS "optimizedContent", r.ats_score AS "atsScore", r.job_id AS "jobId", r.created_at AS "createdAt", j.id AS "job.id", j.description AS "job.description", j.keywords AS "job.keywords"
     FROM resume r
     JOIN job j ON j.id = r.job_id
     WHERE r.id = $1`,
    [resumeId]
  );

  if (!row) {
    return null;
  }

  const jobId = row["job.id"];

  return {
    ...row,
    job: typeof jobId === "string"
      ? {
          id: jobId,
          description: String(row["job.description"] ?? ""),
          keywords: Array.isArray(row["job.keywords"]) ? (row["job.keywords"] as string[]) : []
        }
      : undefined
  } as ResumeRecord;
}

export async function updateOptimizedResume(
  resumeId: string,
  optimizedContent: string,
  atsScore: number
): Promise<ResumeRecord> {
  const rows = await query<ResumeRecord>(
    `UPDATE resume
     SET optimized_content = $2, ats_score = $3
     WHERE id = $1
     RETURNING id, file_name AS "fileName", original_content AS "originalContent", optimized_content AS "optimizedContent", ats_score AS "atsScore", job_id AS "jobId", created_at AS "createdAt"`,
    [resumeId, optimizedContent, atsScore]
  );

  if (!rows[0]) {
    throw new Error("Resume not found");
  }

  return rows[0];
}
