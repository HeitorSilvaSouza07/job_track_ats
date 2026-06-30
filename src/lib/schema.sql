CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS job (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  description text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name varchar(255) NOT NULL,
  original_content text NOT NULL,
  optimized_content text NOT NULL DEFAULT '',
  ats_score double precision NOT NULL DEFAULT 0,
  job_id uuid NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_job_id ON resume(job_id);
CREATE INDEX IF NOT EXISTS idx_job_created_at ON job(created_at DESC);
