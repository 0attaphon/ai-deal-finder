import type { PriceEntry } from "@/lib/price-api";

interface Props {
  prices: PriceEntry[];
}

const STORE_LABELS: Record<string, string> = {
  amazon: "Amazon",
  shopee: "Shopee",
  lazada: "Lazada",
};

export function PriceComparisonTable({ prices }: Props) {
  const available = prices.filter((p) => p.available);
  const sorted = [...available].sort((a, b) => a.price - b.price);
  const lowest = sorted[0];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Price Comparison</h2>
      </div>

      {sorted.length === 0 ? (
        <p className="px-6 py-6 text-sm text-gray-400 italic">
          Price data unavailable for this product.
        </p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3 text-left">Store</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((entry, i) => (
              <tr key={i} className={i === 0 ? "bg-green-50" : "hover:bg-gray-50"}>
                <td className="px-6 py-4 text-sm font-medium text-gray-800 flex items-center gap-2">
                  {STORE_LABELS[entry.store] ?? entry.store}
                  {entry === lowest && (
                    <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Best Price
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-bold ${i === 0 ? "text-green-700" : "text-gray-700"}`}>
                    {entry.currency} {entry.price.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href={entry.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Buy Now →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
