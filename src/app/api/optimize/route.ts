import { NextResponse } from "next/server";
import { analyzeATS } from "@/services/ats.service";
import { optimizeResume } from "@/services/optimize.service";
import { findResumeById, updateOptimizedResume } from "@/services/resume.service";
import { optimizeRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeId } = optimizeRequestSchema.parse(body);
    const resume = await findResumeById(resumeId);

    if (!resume) {
      return NextResponse.json({ message: "Curriculo nao encontrado." }, { status: 404 });
    }

    if (!resume.job) {
      return NextResponse.json({ message: "Curriculo sem informacoes de vaga associadas." }, { status: 400 });
    }

    const optimizedContent = await optimizeResume({
      jobDescription: resume.job.description,
      resumeText: resume.originalContent,
      keywords: resume.job.keywords
    });

    const optimizedAnalysis = await analyzeATS(
      resume.job.description,
      optimizedContent,
      resume.job.keywords
    );
    const updatedResume = await updateOptimizedResume(resume.id, optimizedContent, optimizedAnalysis.score);

    return NextResponse.json({
      jobId: resume.job.id,
      resumeId: updatedResume.id,
      fileName: updatedResume.fileName,
      description: resume.job.description,
      originalContent: updatedResume.originalContent,
      optimizedContent: updatedResume.optimizedContent,
      score: optimizedAnalysis.score,
      keywords: optimizedAnalysis.keywords,
      matchedKeywords: optimizedAnalysis.matchedKeywords,
      missingKeywords: optimizedAnalysis.missingKeywords,
      createdAt: updatedResume.createdAt.toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao otimizar";
    return NextResponse.json({ message }, { status: 400 });
  }
}
