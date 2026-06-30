# ATS Resume Optimizer

Vercel: https://job-track-ats-heitorsilvasouza07s-projects.vercel.app/

Fullstack app with Next.js 15, App Router, TypeScript, TailwindCSS, TypeORM, PostgreSQL and Groq.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill `DATABASE_URL` and `GROQ_API_KEY`.
3. Create the PostgreSQL schema from `src/lib/schema.sql`.
4. Run `npm install`.
5. Run `npm run dev`.

## Main flows

- Paste a job description.
- Upload a PDF or DOCX resume.
- Analyze ATS compatibility.
- Optimize the resume with Groq.
- Export the optimized version as PDF.
