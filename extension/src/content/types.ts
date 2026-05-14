export type Store = "amazon" | "shopee" | "lazada";

export interface ProductData {
  store: Store;
  productId: string;
  title: string;
  reviews: string[];
  productUrl: string;
}

export interface MessageProductData {
  type: "PRODUCT_DATA";
  payload: ProductData | null;
}

export interface ReviewSummary {
  pros: string[];
  cons: string[];
  confidence: number;
}

export interface PriceEntry {
  store: string;
  price: number;
  currency: string;
  affiliateUrl: string;
  available: boolean;
}
