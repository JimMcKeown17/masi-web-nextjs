"use client";

import { formatRand } from "@/lib/finance/money";
import type { BudgetHierarchy } from "@/lib/types/finance-budgets";

/** Published department values only. Numbers below determine visual widths, never money totals. */
export function BudgetVarianceComparison({
  departments,
  metric,
  onSelect,
}: {
  departments: BudgetHierarchy[];
  metric: "variance_all" | "variance_masi";
  onSelect: (department: BudgetHierarchy) => void;
}) {
  const scale = Math.max(
    1,
    ...departments.map((row) => Math.abs(Number(row[metric] ?? 0))),
  );
  return (
    <div
      className="space-y-1"
      aria-label="Department projected variance comparison"
    >
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span
            aria-hidden="true"
            className="mr-2 inline-block size-2 rounded-full bg-[#1D4ED8]"
          />
          Below budget
        </span>
        <span>
          <span
            aria-hidden="true"
            className="mr-2 inline-block size-2 rounded-full bg-[#C81E3C]"
          />
          Above budget
        </span>
        <span>Click a department to explore its lines</span>
      </div>
      {departments.map((row) => {
        const value = row[metric];
        const numeric = Number(value ?? 0);
        const direction =
          value === null
            ? "Needs input"
            : numeric > 0
              ? "Above budget"
              : numeric < 0
                ? "Below budget"
                : "On budget";
        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelect(row)}
            aria-label={`Explore ${row.label}: ${direction}${value === null ? "" : `, ${formatRand(value)}`}`}
            className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] sm:grid-cols-[minmax(8rem,1fr)_minmax(5rem,1fr)_minmax(8rem,auto)]"
          >
            <span className="min-w-0 break-words text-sm font-medium">
              {row.label}
            </span>
            <span
              aria-hidden="true"
              className="relative col-span-2 row-start-2 h-5 sm:col-span-1 sm:col-start-2 sm:row-start-1"
            >
              <span className="absolute bottom-0 left-1/2 top-0 w-px bg-border" />
              {value !== null ? (
                <span
                  className={`absolute top-1 h-3 rounded-sm ${numeric > 0 ? "bg-[#C81E3C]" : "bg-[#1D4ED8]"}`}
                  style={{
                    width: `${(Math.abs(numeric) / scale) * 50}%`,
                    left:
                      numeric < 0
                        ? `${50 - (Math.abs(numeric) / scale) * 50}%`
                        : "50%",
                  }}
                />
              ) : null}
            </span>
            <span className="text-right text-sm tabular-nums">
              <span
                className={
                  numeric > 0
                    ? "font-semibold text-[#C81E3C] dark:text-rose-400"
                    : "font-medium"
                }
              >
                {formatRand(value, "Needs input")}
              </span>
              <span className="block text-xs text-muted-foreground">
                {value === null ? "" : direction}
              </span>
              {value === null ? (
                <span className="block text-xs text-muted-foreground">
                  Partial variance: {formatRand(row.known_subtotals[metric])}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
      {departments.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          No department comparisons available.
        </p>
      ) : null}
    </div>
  );
}
