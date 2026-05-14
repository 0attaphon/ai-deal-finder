import type { ProductData } from "../types";

function extractShopeeItemId(): string | null {
  // Shopee URL: /product-name-i.shopId.itemId
  const match = window.location.pathname.match(/\.(\d+)\.(\d+)$/);
  return match ? `${match[1]}-${match[2]}` : null;
}

function extractTitle(): string | null {
  const selectors = [
    "._44qnta",
    ".product-briefing h1",
    '[class*="product-name"] span',
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
    ".shopee-product-rating__content",
    '[class*="review-item"] [class*="content"]',
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

export function extractShopee(): ProductData | null {
  const productId = extractShopeeItemId();
  const title = extractTitle();

  if (!productId || !title) return null;

  return {
    store: "shopee",
    productId,
    title,
    reviews: extractReviews(),
    productUrl: window.location.href,
  };
}
