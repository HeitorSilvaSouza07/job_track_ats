import { createGroqChatCompletion } from "@/lib/groq";

type OptimizeResumeInput = {
  jobDescription: string;
  resumeText: string;
  keywords: string[];
};

export async function optimizeResumeWithAI(input: OptimizeResumeInput): Promise<string> {
  const prompt = [
    "You are an ATS resume optimization assistant.",
    "Rewrite the resume to better match the job description without inventing fake experience.",
    "Keep the output as a clean plain-text resume.",
    "Preserve truthful achievements, improve keyword alignment, and use concise professional language.",
    "",
    `JOB DESCRIPTION:\n${input.jobDescription}`,
    "",
    `TARGET KEYWORDS:\n${input.keywords.join(", ")}`,
    "",
    `CURRENT RESUME:\n${input.resumeText}`
  ].join("\n");

  return createGroqChatCompletion([
    {
      role: "system",
      content:
        "You rewrite resumes for ATS compatibility. Never fabricate experience, employers, degrees, or metrics."
    },
    {
      role: "user",
      content: prompt
    }
  ]);
}
