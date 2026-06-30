const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "you",
  "are",
  "will",
  "have",
  "has",
  "our",
  "not",
  "can",
  "all",
  "any",
  "but",
  "como",
  "para",
  "que",
  "uma",
  "por",
  "dos",
  "das",
  "das",
  "nos",
  "nas",
  "com",
  "sem",
  "sua",
  "seu",
  "sao"
]);

const IMPORTANT_PHRASES = [
  "project management",
  "stakeholder management",
  "data analysis",
  "software development",
  "business intelligence",
  "machine learning",
  "artificial intelligence",
  "test automation",
  "continuous integration",
  "continuous delivery",
  "customer success",
  "product strategy",
  "frontend development",
  "backend development",
  "cloud architecture",
  "rest api",
  "typescript",
  "next.js",
  "postgresql",
  "react",
  "node.js",
  "docker",
  "kubernetes"
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[-/]+/g, " ")
    .replace(/[^a-z0-9+\-.#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function buildPhrases(tokens: string[]): string[] {
  const phrases = new Set<string>();

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index];
    if (current) {
      phrases.add(current);
    }

    const next = tokens[index + 1];
    const third = tokens[index + 2];

    if (current && next) {
      phrases.add(`${current} ${next}`);
    }

    if (current && next && third) {
      phrases.add(`${current} ${next} ${third}`);
    }
  }

  IMPORTANT_PHRASES.forEach((phrase) => phrases.add(phrase));
  return Array.from(phrases);
}

export function extractKeywords(jobDescription: string, maxKeywords = 20): string[] {
  const tokens = tokenize(jobDescription);
  const counts = new Map<string, number>();
  const phrases = buildPhrases(tokens);

  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "g");
    const matches = jobDescription.toLowerCase().match(regex);
    const frequency = matches?.length ?? 0;

    if (frequency > 0 && phrase.length > 2) {
      counts.set(phrase, frequency + (phrase.includes(" ") ? 2 : 0));
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || right[0].length - left[0].length)
    .map(([keyword]) => keyword)
    .slice(0, maxKeywords);
}

export function analyzeATS(jobDescription: string, resumeText: string) {
  const keywords = extractKeywords(jobDescription);
  const normalizedResume = normalizeText(resumeText);

  const matchedKeywords = keywords.filter((keyword) => normalizedResume.includes(keyword));
  const missingKeywords = keywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const score = keywords.length === 0 ? 0 : Math.round((matchedKeywords.length / keywords.length) * 100);

  return {
    keywords,
    matchedKeywords,
    missingKeywords,
    score
  };
}
