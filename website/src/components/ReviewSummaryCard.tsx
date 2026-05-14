import type { ReviewSummaryResult } from "@/lib/openai";

interface Props {
  summary: ReviewSummaryResult;
}

export function ReviewSummaryCard({ summary }: Props) {
  const confidencePct = Math.round(summary.confidence * 100);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">AI Review Summary</h2>
        <span className="text-sm text-gray-400">{confidencePct}% confidence</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-green-700 mb-2">✓ Pros</p>
          {summary.pros.length === 0 ? (
            <p className="text-sm text-gray-400 italic">None found</p>
          ) : (
            <ul className="space-y-1.5">
              {summary.pros.map((pro, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                  {pro}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-red-600 mb-2">✗ Cons</p>
          {summary.cons.length === 0 ? (
            <p className="text-sm text-gray-400 italic">None found</p>
          ) : (
            <ul className="space-y-1.5">
              {summary.cons.map((con, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                  {con}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {summary.confidence < 0.4 && (
        <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded px-3 py-1.5">
          ⚠ Low confidence — reviews may be limited or unreliable.
        </p>
      )}
    </div>
  );
}
