import { buildAffiliateUrl, type SupportedStore } from "./affiliate";

export type { SupportedStore };

export interface PriceEntry {
  store: SupportedStore;
  price: number;
  currency: string;
  affiliateUrl: string;
  available: boolean;
}

// Abstraction layer — swap provider here without touching API route
export async function fetchPricesFromAPI(
  productId: string,
  store: SupportedStore
): Promise<PriceEntry[]> {
  const apiKey = process.env.PRICE_API_KEY;
  const apiHost = process.env.PRICE_API_HOST;

  // Without a real API key, return mock data for development
  if (!apiKey || !apiHost) {
    return getMockPrices(productId, store);
  }

  try {
    const res = await fetch(
      `https://${apiHost}/prices?productId=${productId}&store=${store}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": apiHost,
        },
        next: { revalidate: 300 }, // 5-minute Next.js cache
      }
    );

    if (!res.ok) return getMockPrices(productId, store);

    const data = (await res.json()) as Array<{
      store: string;
      price: number;
      currency: string;
      url: string;
      available: boolean;
    }>;

    return data.map((item) => ({
      store: item.store as SupportedStore,
      price: item.price,
      currency: item.currency,
      affiliateUrl: buildAffiliateUrl(item.store as SupportedStore, item.url, productId),
      available: item.available,
    }));
  } catch {
    return getMockPrices(productId, store);
  }
}

// Development fallback — used when PRICE_API_KEY is not set
function getMockPrices(productId: string, store: SupportedStore): PriceEntry[] {
  const basePrice = (productId.charCodeAt(0) % 50 + 10) * 100;

  // productId format: shopId-itemId (e.g. "797730103-29736997537")
  const [shopId, itemId] = productId.split("-");
  const shopeeUrl = shopId && itemId
    ? `https://shopee.co.th/i.${shopId}.${itemId}`
    : `https://shopee.co.th/search?keyword=${encodeURIComponent(productId)}`;

  return [
    {
      store: "shopee",
      price: Math.round(basePrice * 0.92),
      currency: "THB",
      affiliateUrl: shopeeUrl,
      available: true,
    },
    {
      store: "lazada",
      price: Math.round(basePrice * 0.97),
      currency: "THB",
      affiliateUrl: `https://www.lazada.co.th/catalog/?q=${encodeURIComponent(productId)}`,
      available: store !== "lazada",
    },
    {
      store: "amazon",
      price: basePrice,
      currency: "THB",
      affiliateUrl: `https://www.amazon.com/s?k=${encodeURIComponent(productId)}`,
      available: true,
    },
  ];
}
