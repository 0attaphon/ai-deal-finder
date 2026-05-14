import { NextRequest, NextResponse } from "next/server";
import { fetchPricesFromAPI, type SupportedStore } from "@/lib/price-api";

const SUPPORTED_STORES: SupportedStore[] = ["amazon", "shopee", "lazada"];

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const corsHeaders: Record<string, string> =
    origin.startsWith("chrome-extension://")
      ? { "Access-Control-Allow-Origin": origin }
      : {};

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const store = searchParams.get("store") as SupportedStore | null;

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  if (!store || !SUPPORTED_STORES.includes(store)) {
    return NextResponse.json(
      { error: `store must be one of: ${SUPPORTED_STORES.join(", ")}` },
      { status: 400 }
    );
  }

  const prices = await fetchPricesFromAPI(productId, store);
  return NextResponse.json(prices, { headers: corsHeaders });
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin.startsWith("chrome-extension://") ? origin : "",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
