import { createGroqChatCompletion } from "@/lib/groq";

type OptimizeResumeInput = {
  jobDescription: string;
  resumeText: string;
  keywords: string[];
};

export async function optimizeResumeWithAI(input: OptimizeResumeInput): Promise<string> {
  const prompt = [
    "You are an ATS resume optimization assistant for any industry.",
    "Rewrite the resume to better match the job description without inventing fake experience.",
    "Your goal is to produce a resume that is highly compatible with most ATS parsers, regardless of industry.",
    "Keep the output as clean plain text with standard resume sections and simple structure.",
    "Avoid tables, columns, icons, emojis, text boxes, graphics, charts, hidden text, and unusual formatting.",
    "Prefer common section headings such as Summary, Professional Experience, Education, Certifications, Skills, Projects, and Additional Information when relevant.",
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
