import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { summarizeReviews } from "@/lib/openai";
import { fetchPricesFromAPI } from "@/lib/price-api";
import { ReviewSummaryCard } from "@/components/ReviewSummaryCard";
import { PriceComparisonTable } from "@/components/PriceComparisonTable";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Product ${id} — AI Deal Finder`,
    description: `AI-powered review summary and price comparison for product ${id}`,
    openGraph: {
      title: `AI Deal Finder — Best Price for ${id}`,
      description: "See AI review summary and compare prices instantly.",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  // Detect store from product ID format
  const store = id.includes("-")
    ? "shopee"
    : id.match(/^\d+$/)
    ? "lazada"
    : "amazon";

  const supabase = createAdminClient();

  // Fetch cached summary or generate fresh
  const CACHE_TTL = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: cached } = await supabase
    .from("review_summaries")
    .select("pros, cons, confidence_score")
    .eq("product_id", id)
    .gte("cached_at", CACHE_TTL)
    .maybeSingle();

  const summary = cached
    ? { pros: cached.pros, cons: cached.cons, confidence: cached.confidence_score }
    : await summarizeReviews([], "en");

  const prices = await fetchPricesFromAPI(id, store as "amazon" | "shopee" | "lazada");

  if (!summary && prices.length === 0) notFound();

  // JSON-LD structured data for SEO
  const bestPrice = prices.filter((p) => p.available).sort((a, b) => a.price - b.price)[0];
  const jsonLd = bestPrice
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `Product ${id}`,
        offers: {
          "@type": "Offer",
          price: bestPrice.price,
          priceCurrency: bestPrice.currency,
          availability: "https://schema.org/InStock",
          url: bestPrice.affiliateUrl,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* AdSense — top banner */}
        <AdSenseUnit slot="1234567890" format="horizontal" className="mb-6" />

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Product {id} — AI Analysis
        </h1>

        <div className="space-y-6">
          <ReviewSummaryCard summary={summary} />

          {/* AdSense — in-content */}
          <AdSenseUnit slot="0987654321" format="rectangle" />

          <PriceComparisonTable prices={prices} />
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">
            Get instant AI analysis on any product page
          </p>
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add AI Deal Finder to Chrome — Free
          </a>
        </div>
      </main>
    </>
  );
}
