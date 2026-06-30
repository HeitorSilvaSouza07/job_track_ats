export type AtsAnalysis = {
  jobId: string;
  resumeId: string;
  fileName: string;
  description: string;
  originalContent: string;
  optimizedContent?: string;
  score: number;
  keywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  createdAt?: string;
};

export type DashboardEntry = {
  id: string;
  description: string;
  score: number;
  bestScore: number;
  createdAt: string;
  resumeCount: number;
};
