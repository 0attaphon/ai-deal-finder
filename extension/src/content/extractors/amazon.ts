import type { ProductData } from "../types";

function trySelectors(selectors: string[]): string | null {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return null;
}

function extractAsin(): string | null {
  // From URL: /dp/ASIN or /gp/product/ASIN
  const match = window.location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  return match?.[1] ?? null;
}

function extractTitle(): string | null {
  return trySelectors([
    "#productTitle",
    'span[data-action="span-title"] span',
    "h1.a-size-large",
  ]);
}

function extractReviews(): string[] {
  const reviewEls = document.querySelectorAll(
    '[data-hook="review-body"] span, .review-text-content span'
  );
  return Array.from(reviewEls)
    .map((el) => el.textContent?.trim() ?? "")
    .filter((text) => text.length > 20)
    .slice(0, 10);
}

export function extractAmazon(): ProductData | null {
  const productId = extractAsin();
  const title = extractTitle();

  if (!productId || !title) return null;

  return {
    store: "amazon",
    productId,
    title,
    reviews: extractReviews(),
    productUrl: window.location.href,
  };
}
