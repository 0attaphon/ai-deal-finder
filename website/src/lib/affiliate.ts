export type SupportedStore = "amazon" | "shopee" | "lazada";

export function buildAffiliateUrl(
  store: SupportedStore,
  productUrl: string,
  _productId: string
): string {
  try {
    const url = new URL(productUrl);

    if (store === "amazon") {
      const tag = process.env.AMAZON_AFFILIATE_TAG;
      if (tag) url.searchParams.set("tag", tag);
      return url.toString();
    }

    if (store === "shopee") {
      // Shopee affiliate uses their own deep link system
      const affiliateId = process.env.SHOPEE_AFFILIATE_ID;
      if (!affiliateId) return productUrl;
      return `https://shope.ee/affiliate?url=${encodeURIComponent(productUrl)}&aff_id=${affiliateId}`;
    }

    if (store === "lazada") {
      const affiliateId = process.env.LAZADA_AFFILIATE_ID;
      if (!affiliateId) return productUrl;
      return `https://c.lazada.co.th/t/c.${affiliateId}?url=${encodeURIComponent(productUrl)}`;
    }
  } catch {
    // Invalid URL — return original
  }

  return productUrl;
}
