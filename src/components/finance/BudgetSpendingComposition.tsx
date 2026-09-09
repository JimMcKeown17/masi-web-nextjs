"use client";

import type {
  BudgetComposition,
  BudgetHierarchy,
} from "@/lib/types/finance-budgets";
import { formatRand } from "@/lib/finance/money";

const COLOURS = [
  "#1D4ED8",
  "#C81E3C",
  "#64748B",
  "#94A3B8",
  "#E72D4D",
  "#475569",
  "#93C5FD",
];
const UNAVAILABLE_REASONS: Record<string, string> = {
  incomplete_actuals: "Some department actuals are unavailable.",
  negative_amounts: "Negative expenditure cannot be represented as slices.",
  zero_total: "There is no positive annual expenditure to chart.",
};

export function BudgetSpendingComposition({
  composition,
  departments,
  onSelect,
}: {
  composition: BudgetComposition;
  departments: BudgetHierarchy[];
  onSelect: (department: BudgetHierarchy) => void;
}) {
  // Normalise exact-source percentage strings only for SVG geometry. Money is never a chart operand.
  const segments = composition.buckets.map((bucket) => ({
    bucket,
    visualShare: bucket.percentage === null ? NaN : Number(bucket.percentage),
  }));
  const visualShareTotal = segments.reduce(
    (sum, segment) => sum + segment.visualShare,
    0,
  );
  const chartAvailable =
    composition.available &&
    Number.isFinite(visualShareTotal) &&
    visualShareTotal > 0 &&
    segments.every(
      (segment) =>
        Number.isFinite(segment.visualShare) &&
        segment.visualShare >= 0 &&
        segment.visualShare <= 100,
    );
  const arcs: { id: string; length: number; start: number }[] = [];
  if (chartAvailable) {
    let offset = 0;
    for (const { bucket, visualShare } of segments) {
      const length = (visualShare / visualShareTotal) * 100;
      arcs.push({ id: bucket.id, length, start: offset });
      offset += length;
    }
  }

  return (
    <section
      aria-labelledby="spending-composition-title"
      className="rounded-xl border bg-card p-4 sm:p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="spending-composition-title" className="font-serif text-2xl">
            Where we spend
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Actual expenditure for the accounting year, across all funds.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            Annual ledger expenditure
          </p>
          <p className="font-serif text-2xl tabular-nums">
            {formatRand(composition.total)}
          </p>
        </div>
      </header>
      <div
        className={`mt-4 grid gap-5 ${chartAvailable ? "lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center" : ""}`}
      >
        {chartAvailable ? (
          <svg
            viewBox="0 0 220 220"
            className="mx-auto w-full max-w-[220px]"
            aria-hidden="true"
            data-testid="spending-composition-chart"
          >
            <circle
              cx="110"
              cy="110"
              r="82"
              fill="none"
              stroke="currentColor"
              strokeWidth="30"
              className="text-muted"
            />
            {arcs.map(({ id, length, start }, index) => {
              return (
                <circle
                  key={id}
                  cx="110"
                  cy="110"
                  r="82"
                  pathLength="100"
                  fill="none"
                  stroke={COLOURS[index % COLOURS.length]}
                  strokeWidth="30"
                  strokeDasharray={`${length} ${Math.max(0, 100 - length)}`}
                  strokeDashoffset={-start}
                  transform="rotate(-90 110 110)"
                />
              );
            })}
            <text
              x="110"
              y="105"
              textAnchor="middle"
              className="fill-foreground text-sm font-medium"
            >
              Spending mix
            </text>
            <text
              x="110"
              y="126"
              textAnchor="middle"
              className="fill-muted-foreground text-xs"
            >
              All funds
            </text>
          </svg>
        ) : (
          <div
            role="status"
            className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground"
          >
            <p className="font-medium text-foreground">
              Spending chart unavailable
            </p>
            {composition.reasons.length > 0 ? (
              composition.reasons.map((reason) => (
                <p key={reason} className="mt-1">
                  {UNAVAILABLE_REASONS[reason] ??
                    "A spending mix is not available for these figures."}
                </p>
              ))
            ) : (
              <p className="mt-1">
                A spending mix is not available for these figures.
              </p>
            )}
            <p className="mt-1">The recorded amounts remain available below.</p>
          </div>
        )}
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Annual expenditure by department, including unbudgeted and
              unmapped expenditure
            </caption>
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th scope="col" className="py-2 pr-3 text-left font-medium">
                  Department
                </th>
                <th scope="col" className="px-2 py-2 text-right font-medium">
                  Expenditure
                </th>
                <th scope="col" className="py-2 pl-2 text-right font-medium">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {composition.buckets.map((bucket, index) => {
                const department = departments.find(
                  (row) => row.id === bucket.id,
                );
                return (
                  <tr key={bucket.id} className="border-b last:border-b-0">
                    <th scope="row" className="py-3 pr-3 text-left font-normal">
                      <span
                        aria-hidden="true"
                        className="mr-2 inline-block size-2.5 rounded-full"
                        style={{
                          backgroundColor: COLOURS[index % COLOURS.length],
                        }}
                      />
                      {department ? (
                        <button
                          type="button"
                          onClick={() => onSelect(department)}
                          className="text-left font-medium text-[#1D4ED8] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#1D4ED8] dark:text-blue-300"
                        >
                          {bucket.label}
                        </button>
                      ) : (
                        bucket.label
                      )}
                    </th>
                    <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">
                      {formatRand(bucket.amount, "Unavailable")}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-2 text-right tabular-nums">
                      {bucket.percentage === null
                        ? "Unavailable"
                        : `${Number(bucket.percentage).toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
        This is a spending view, not a measure of flexible funding. Unbudgeted
        expenditure is included in the annual total. Percentages are rounded and
        may not add to exactly 100%.
      </p>
      {composition.residual !== null && composition.residual !== "0.00" ? (
        <p className="mt-1 text-xs text-muted-foreground">
          The annual total includes a rounding difference of{" "}
          {formatRand(composition.residual)} from the displayed bucket amounts.
        </p>
      ) : null}
    </section>
  );
}
