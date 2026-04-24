import type { AssessmentResultRow } from "@/lib/masi/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Accuracy column stores a percent 0-100 (not a 0-1 fraction). Mobile app
// thresholds like `accuracy >= 75` in AssessmentResultsScreen.js confirm the
// unit. Just round to a whole percent — do not multiply.
function formatAccuracy(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)}%`;
}

export function AssessmentResultsTable({ rows }: { rows: AssessmentResultRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-8 text-center text-muted-foreground text-sm">
        No assessments recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Coach</th>
              <th className="text-left px-4 py-3 font-semibold">Child</th>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-right px-4 py-3 font-semibold">Correct</th>
              <th className="text-right px-4 py-3 font-semibold">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 tabular-nums whitespace-nowrap">
                  {formatDate(row.date_assessed)}
                </td>
                <td className="px-4 py-3">{row.coach_name ?? "—"}</td>
                <td className="px-4 py-3">
                  {row.child_name ?? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <span className="italic">unknown child</span>
                      <span
                        className="text-[10px] uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded"
                        title="The assessment references a child_id with no matching row in the children table. Possible offline-sync artifact."
                      >
                        orphan
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.assessment_type ?? "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.correct_responses ?? "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {formatAccuracy(row.accuracy)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
