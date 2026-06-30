import { NextResponse } from "next/server";
import { analyzeATS } from "@/services/ats.service";
import { createJob } from "@/services/job.service";
import { createResume } from "@/services/resume.service";
import { extractResumeText, normalizeFilename } from "@/lib/parser";
import { jobDescriptionSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const description = jobDescriptionSchema.parse(String(formData.get("jobDescription") ?? ""));
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Arquivo ausente." }, { status: 400 });
    }

    const originalContent = await extractResumeText(file);
    const analysis = await analyzeATS(description, originalContent);
    const job = await createJob(description, analysis.keywords);
    const resume = await createResume({
      fileName: normalizeFilename(file.name),
      originalContent,
      atsScore: analysis.score,
      job
    });

    return NextResponse.json({
      jobId: job.id,
      resumeId: resume.id,
      fileName: resume.fileName,
      description: job.description,
      originalContent,
      score: analysis.score,
      keywords: analysis.keywords,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      createdAt: resume.createdAt.toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao analisar";
    return NextResponse.json({ message }, { status: 400 });
  }
}
