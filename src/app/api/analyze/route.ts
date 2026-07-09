import { NextResponse } from "next/server";
import { analyzeATS } from "@/services/ats.service";
import { createJob } from "@/services/job.service";
import { createResume } from "@/services/resume.service";
import { extractResumeText, normalizeFilename } from "@/lib/parser";
import { jobDescriptionSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    console.log("Analyze route: parsing form data");
    const formData = await request.formData();
    const description = jobDescriptionSchema.parse(String(formData.get("jobDescription") ?? ""));
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Arquivo ausente." }, { status: 400 });
    }

    console.log("Analyze route: extracting resume text");
    const originalContent = await extractResumeText(file);
    console.log("Analyze route: extracted text", { length: originalContent.length });

    console.log("Analyze route: analyzing ATS");
    const analysis = await analyzeATS(description, originalContent);
    console.log("Analyze route: analysis complete", analysis);

    console.log("Analyze route: creating job");
    const job = await createJob(description, analysis.keywords);
    console.log("Analyze route: creating resume");
    const resume = await createResume({
      fileName: normalizeFilename(file.name),
      originalContent,
      atsScore: analysis.score,
      job
    });
    console.log("Analyze route: resume created", resume.id);

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
    console.error("Analyze route error:", error);
    const message = error instanceof Error ? error.message : "Erro ao analisar";
    const details = error instanceof Error && "cause" in error ? String((error as Error & { cause?: unknown }).cause) : undefined;
    return NextResponse.json(
      {
        message,
        ...(details ? { details } : {})
      },
      { status: 400 }
    );
  }
}
