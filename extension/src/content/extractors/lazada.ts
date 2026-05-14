import type { ProductData } from "../types";

function extractLazadaItemId(): string | null {
  // Lazada URL contains ?itemId=XXX or path segment like /products/name-i123456789.html
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("itemId")) return urlParams.get("itemId");

  const match = window.location.pathname.match(/i(\d+)\.html/);
  return match?.[1] ?? null;
}

function extractTitle(): string | null {
  const selectors = [
    ".pdp-mod-product-badge-title",
    "h1.title",
    '[class*="product-title"]',
    "h1",
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return null;
}

function extractReviews(): string[] {
  const selectors = [
    ".item-content .content",
    '[class*="review"] [class*="content"]',
  ];
  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    if (els.length > 0) {
      return Array.from(els)
        .map((el) => el.textContent?.trim() ?? "")
        .filter((t) => t.length > 20)
        .slice(0, 10);
    }
  }
  return [];
}

export function extractLazada(): ProductData | null {
  const productId = extractLazadaItemId();
  const title = extractTitle();

  if (!productId || !title) return null;

  return {
    store: "lazada",
    productId,
    title,
    reviews: extractReviews(),
    productUrl: window.location.href,
  };
}
