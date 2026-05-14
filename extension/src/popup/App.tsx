import { useEffect, useState } from "react";
import type { MessageProductData, ProductData, PriceEntry, ReviewSummary } from "../content/types";
import { LoadingState } from "./components/LoadingState";
import { ReviewSummaryCard } from "./components/ReviewSummaryCard";
import { PriceComparisonRow } from "./components/PriceComparisonRow";
import { fetchReviewSummary, fetchPrices } from "./api";

import { SITE_URL } from "./config";

type AppState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "results"; product: ProductData; summary: ReviewSummary; prices: PriceEntry[] }
  | { status: "error"; message: string }
  | { status: "no-product" };

export default function App() {
  const [state, setState] = useState<AppState>({ status: "loading" });

  useEffect(() => {
    // Ask the active tab's content script for product data
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) {
        setState({ status: "no-product" });
        return;
      }

      chrome.tabs.sendMessage(
        tabId,
        { type: "REQUEST_PRODUCT_DATA" },
        () => {
          if (chrome.runtime.lastError) {
            // Content script not injected (not a supported page)
            setState({ status: "no-product" });
          }
        }
      );
    });

    // Listen for product data sent by content script
    const handler = (message: MessageProductData) => {
      if (message.type !== "PRODUCT_DATA") return;

      if (!message.payload) {
        setState({ status: "no-product" });
        return;
      }

      const product = message.payload;
      setState({ status: "loading" });

      Promise.all([
        fetchReviewSummary(product.productId, product.reviews),
        fetchPrices(product.productId, product.store),
      ])
        .then(([summary, prices]) => {
          setState({ status: "results", product, summary, prices });
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Unknown error";
          setState({ status: "error", message: msg });
        });
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  return (
    <div className="bg-white min-h-[200px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500">
        <span className="text-white text-lg">🔍</span>
        <span className="text-white font-semibold text-sm tracking-wide">
          AI Deal Finder
        </span>
      </div>

      {state.status === "loading" && <LoadingState />}

      {state.status === "no-product" && (
        <div className="px-4 py-8 text-center">
          <p className="text-2xl mb-2">🛒</p>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Open a product page to get started
          </p>
          <p className="text-xs text-gray-400">
            Works on Amazon, Shopee, and Lazada
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="px-4 py-6 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Could not load data
          </p>
          <p className="text-xs text-gray-400 mb-3">{state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {state.status === "results" && (
        <>
          {/* Product title */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-800 line-clamp-2">
              {state.product.title}
            </p>
          </div>

          <ReviewSummaryCard summary={state.summary} />
          <PriceComparisonRow
            prices={state.prices}
            productId={state.product.productId}
            siteUrl={SITE_URL}
          />
        </>
      )}
    </div>
  );
}
