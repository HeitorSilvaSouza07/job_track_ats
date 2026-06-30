import axios from "axios";

const groqClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 60000
});

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function createGroqChatCompletion(messages: GroqMessage[]): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is required");
  }

  const response = await groqClient.post("/chat/completions", {
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.2
  }, {
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    }
  });

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Groq returned an empty completion");
  }

  return content.trim();
}
