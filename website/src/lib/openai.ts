import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    const gatewayKey = process.env.VERCEL_AI_GATEWAY_KEY;
    _openai = gatewayKey
      ? new OpenAI({
          apiKey: gatewayKey,
          baseURL: "https://ai.vercel.is/v1/openai",
        })
      : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface ReviewSummaryResult {
  pros: string[];
  cons: string[];
  confidence: number;
}

export async function summarizeReviews(
  reviews: string[],
  language: "en" | "th" = "en"
): Promise<ReviewSummaryResult> {
  if (reviews.length === 0) {
    return { pros: [], cons: [], confidence: 0 };
  }

  const langInstruction =
    language === "th"
      ? "Respond in Thai language."
      : "Respond in English.";

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a product review analyst. Analyze customer reviews and return a JSON object with:
- "pros": array of up to 5 concise positive points (strings)
- "cons": array of up to 5 concise negative points (strings)
- "confidence": a number 0-1 reflecting how genuine and informative the reviews seem (0 = likely fake/uninformative, 1 = clearly genuine and detailed)
${langInstruction}
Keep each point under 15 words. Return ONLY valid JSON.`,
      },
      {
        role: "user",
        content: `Reviews:\n${reviews.map((r, i) => `${i + 1}. ${r}`).join("\n")}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as Partial<ReviewSummaryResult>;

  return {
    pros: Array.isArray(parsed.pros) ? parsed.pros.slice(0, 5) : [],
    cons: Array.isArray(parsed.cons) ? parsed.cons.slice(0, 5) : [],
    confidence: typeof parsed.confidence === "number"
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0.5,
  };
}
