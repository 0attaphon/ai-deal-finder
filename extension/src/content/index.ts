import { extractAmazon } from "./extractors/amazon";
import { extractShopee } from "./extractors/shopee";
import { extractLazada } from "./extractors/lazada";
import type { MessageProductData } from "./types";

function detectStore(): "amazon" | "shopee" | "lazada" | null {
  const host = window.location.hostname;
  if (host.includes("amazon")) return "amazon";
  if (host.includes("shopee")) return "shopee";
  if (host.includes("lazada")) return "lazada";
  return null;
}

function extractAndSend(): void {
  const store = detectStore();
  let payload = null;

  if (store === "amazon") payload = extractAmazon();
  else if (store === "shopee") payload = extractShopee();
  else if (store === "lazada") payload = extractLazada();

  const message: MessageProductData = { type: "PRODUCT_DATA", payload };
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup not open — no listener, ignore
  });
}

// Initial extract on page load
extractAndSend();

// Re-extract on SPA navigation (Shopee/Lazada use client-side routing)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    setTimeout(extractAndSend, 800); // wait for DOM to settle after navigation
  }
});
observer.observe(document.querySelector("title") ?? document.body, {
  childList: true,
  subtree: true,
});

// Also respond to popup requesting data on demand
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "REQUEST_PRODUCT_DATA") {
    extractAndSend();
    sendResponse({ ok: true });
  }
});
