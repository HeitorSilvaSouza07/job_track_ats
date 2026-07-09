# ATS Resume Optimizer

Vercel: https://job-track-ats-heitorsilvasouza07s-projects.vercel.app/

Fullstack app with Next.js 15, App Router, TypeScript, TailwindCSS, TypeORM, PostgreSQL and Groq.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill `DATABASE_URL` with your Neon PostgreSQL connection string and `GROQ_API_KEY`.
3. Ensure the database schema exists in your Neon project.
4. Run `npm install`.
5. Run `npm run dev`.

## Persistence model

- All application data is stored in PostgreSQL via Neon.
- No local database, SQLite, or device storage is used for persistence.
- The app expects `DATABASE_URL` to point to a PostgreSQL connection string.

## Main flows

- Paste a job description.
- Upload a PDF or DOCX resume.
- Analyze ATS compatibility.
- Optimize the resume with Groq.
- Export the optimized version as PDF.
