import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { summarizeReviews } from "@/lib/openai";

const CACHE_TTL_HOURS = 24;

export async function POST(request: NextRequest) {
  // CORS — allow Chrome extension origin
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL ?? "",
    // Chrome extension origins: chrome-extension://EXTENSION_ID
  ];
  const corsHeaders: Record<string, string> =
    origin.startsWith("chrome-extension://") || allowedOrigins.includes(origin)
      ? { "Access-Control-Allow-Origin": origin }
      : {};

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { productId, reviews, language } = body as {
    productId?: string;
    reviews?: string[];
    language?: string;
  };

  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const lang = language === "th" ? "th" : "en";
  const supabase = createAdminClient();

  // Check cache
  const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const { data: cached } = await supabase
    .from("review_summaries")
    .select("pros, cons, confidence_score")
    .eq("product_id", productId)
    .eq("language", lang)
    .gte("cached_at", cutoff)
    .maybeSingle();

  if (cached) {
    return NextResponse.json(
      { pros: cached.pros, cons: cached.cons, confidence: cached.confidence_score },
      { headers: corsHeaders }
    );
  }

  // Cache miss — call OpenAI
  const reviewList = Array.isArray(reviews) ? reviews.filter(Boolean) : [];
  const summary = await summarizeReviews(reviewList, lang);

  // Store in Supabase (upsert)
  await supabase.from("review_summaries").upsert({
    product_id: productId,
    language: lang,
    pros: summary.pros,
    cons: summary.cons,
    confidence_score: summary.confidence,
    cached_at: new Date().toISOString(),
  });

  return NextResponse.json(summary, { headers: corsHeaders });
}

// Preflight CORS for extension
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin.startsWith("chrome-extension://") ? origin : "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
