import type { PriceEntry } from "../../content/types";

interface Props {
  prices: PriceEntry[];
  productId: string;
  siteUrl: string;
}

const STORE_LABELS: Record<string, string> = {
  amazon: "Amazon",
  shopee: "Shopee",
  lazada: "Lazada",
};

export function PriceComparisonRow({ prices, productId, siteUrl }: Props) {
  const available = prices.filter((p) => p.available);
  const sorted = [...available].sort((a, b) => a.price - b.price);

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">
        Price Comparison
      </h2>

      {sorted.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Prices unavailable.</p>
      ) : (
        <div className="space-y-1.5">
          {sorted.map((p, i) => (
            <a
              key={i}
              href={p.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-xs hover:bg-gray-50 rounded px-1 py-0.5 group"
            >
              <span className="text-gray-600 group-hover:text-blue-600 transition-colors">
                {STORE_LABELS[p.store] ?? p.store}
              </span>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${i === 0 ? "text-green-600" : "text-gray-700"}`}>
                  {p.currency} {p.price.toLocaleString()}
                </span>
                {i === 0 && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1 py-0.5 rounded">
                    Best
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      <a
        href={`${siteUrl}/product/${productId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3 text-center text-xs text-blue-600 hover:text-blue-800 font-medium"
      >
        View full comparison →
      </a>
    </div>
  );
}
