import type { PriceEntry, ReviewSummary } from "../content/types";
import { SITE_URL } from "./config";

export async function fetchReviewSummary(
  productId: string,
  reviews: string[],
  language: "en" | "th" = "en"
): Promise<ReviewSummary> {
  const res = await fetch(`${SITE_URL}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, reviews, language }),
  });
  if (!res.ok) throw new Error(`Summarize API error: ${res.status}`);
  return res.json();
}

export async function fetchPrices(
  productId: string,
  store: string
): Promise<PriceEntry[]> {
  const res = await fetch(
    `${SITE_URL}/api/prices?productId=${encodeURIComponent(productId)}&store=${store}`
  );
  if (!res.ok) throw new Error(`Prices API error: ${res.status}`);
  return res.json();
}
