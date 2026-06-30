import { optimizeResumeWithAI } from "@/services/groq.service";

type OptimizeResumeInput = {
  jobDescription: string;
  resumeText: string;
  keywords: string[];
};

export async function optimizeResume(input: OptimizeResumeInput): Promise<string> {
  return optimizeResumeWithAI({
    ...input,
    keywords: input.keywords
  });
}
