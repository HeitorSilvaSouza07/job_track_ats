import { z } from "zod";
import { createGroqChatCompletion } from "@/lib/groq";

const atsAnalysisSchema = z.object({
  keywords: z.array(z.string().min(1)).min(1),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  score: z.number().min(0).max(100),
  summary: z.string().nullable().optional()
});

type AtsAnalysisInput = {
  jobDescription: string;
  resumeText: string;
  existingKeywords?: string[];
};

type AtsAnalysisResult = {
  keywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  score: number;
  summary?: string;
};

function normalizeList(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function extractJsonBlock(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  throw new Error("Groq returned content that is not valid JSON");
}

function buildAnalysisPrompt(input: AtsAnalysisInput): string {
  return [
    "Analyze the job description and resume for ATS compatibility across any industry: operations, sales, marketing, finance, healthcare, education, logistics, administration, legal, retail, hospitality, manufacturing, and technology.",
    "Extract the most important keywords from the job description, identify which ones appear in the resume, and rate the resume fit as a percentage.",
    "Use only truthful matching. Do not invent skills or experience that are not present in the resume.",
    "Return strict JSON only with the shape:",
    '{ "keywords": string[], "matchedKeywords": string[], "missingKeywords": string[], "score": number, "summary"?: string }',
    "Rules:",
    "- keywords should contain the most relevant canonical ATS terms, not vague generic words.",
    "- matchedKeywords must be a subset of keywords present in the resume.",
    "- missingKeywords must be important keywords from the job description that are absent from the resume.",
    "- score must reflect overall ATS fit, weighting hard skills, role-specific terms, certifications, tools, responsibilities, and required experience.",
    "- prefer standard resume terminology that ATS parsers recognize well.",
    "- include broad industry terms when the job is not technical.",
    "",
    `JOB DESCRIPTION:\n${input.jobDescription}`,
    "",
    `RESUME:\n${input.resumeText}`,
    input.existingKeywords?.length
      ? ""
      : "If useful, infer keywords directly from the job description before scoring."
  ]
    .filter(Boolean)
    .join("\n");
}

async function parseAnalysisResponse(raw: string): Promise<AtsAnalysisResult> {
  const json = extractJsonBlock(raw);
  const data = JSON.parse(json);

  if (typeof data.score === "string") {
    data.score = Number(data.score);
  }

  const parsed = atsAnalysisSchema.parse(data);

  return {
    keywords: normalizeList(parsed.keywords),
    matchedKeywords: normalizeList(parsed.matchedKeywords),
    missingKeywords: normalizeList(parsed.missingKeywords),
    score: Math.round(parsed.score),
    summary: parsed.summary?.trim()
  };
}

export async function extractKeywords(jobDescription: string): Promise<string[]> {
  const response = await createGroqChatCompletion([
    {
      role: "system",
      content:
        "You extract ATS keywords from job descriptions for any industry. Return strict JSON only."
    },
    {
      role: "user",
      content: [
        "Return strict JSON only in the form {\"keywords\": string[]}.",
        "Choose the most important ATS keywords, canonical terms, certifications, tools, responsibilities, and seniority signals.",
        "Avoid vague filler words.",
        "",
        `JOB DESCRIPTION:\n${jobDescription}`
      ].join("\n")
    }
  ]);

  const parsed = z.object({ keywords: z.array(z.string().min(1)).min(1) }).parse(JSON.parse(extractJsonBlock(response)));
  return normalizeList(parsed.keywords);
}

export async function analyzeATS(
  jobDescription: string,
  resumeText: string,
  existingKeywords?: string[]
): Promise<AtsAnalysisResult> {
  const rawResponse = await createGroqChatCompletion([
    {
      role: "system",
      content:
        "You are an ATS analyst that works across all industries. Return strict JSON only and keep your scoring practical."
    },
    {
      role: "user",
      content: buildAnalysisPrompt({ jobDescription, resumeText, existingKeywords })
    }
  ]);

  const analysis = await parseAnalysisResponse(rawResponse);

  if (!analysis.keywords.length) {
    analysis.keywords = existingKeywords?.length ? normalizeList(existingKeywords) : [];
  }

  return analysis;
}
