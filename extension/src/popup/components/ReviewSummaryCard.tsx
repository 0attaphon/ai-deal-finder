import type { ReviewSummary } from "../../content/types";

interface Props {
  summary: ReviewSummary;
}

export function ReviewSummaryCard({ summary }: Props) {
  const confidencePct = Math.round(summary.confidence * 100);

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">AI Review Summary</h2>
        <span className="text-xs text-gray-400">
          {confidencePct}% confidence
        </span>
      </div>

      {summary.pros.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-green-600 mb-1">Pros</p>
          <ul className="space-y-1">
            {summary.pros.map((pro, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-gray-700">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.cons.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-500 mb-1">Cons</p>
          <ul className="space-y-1">
            {summary.cons.map((con, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-gray-700">
                <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.pros.length === 0 && summary.cons.length === 0 && (
        <p className="text-xs text-gray-400 italic">
          Not enough reviews to summarize.
        </p>
      )}
    </div>
  );
}
