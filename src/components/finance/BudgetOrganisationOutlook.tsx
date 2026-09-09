import type {
  BudgetInsights,
  BudgetInsightMetric,
} from "@/lib/types/finance-budgets";
import { formatRand } from "@/lib/finance/money";

function MetricAmount({
  metric,
  prominent = false,
}: {
  metric: BudgetInsightMetric;
  prominent?: boolean;
}) {
  return (
    <>
      <p
        className={`${prominent ? "font-serif text-3xl sm:text-4xl" : "text-lg font-medium"} break-words tabular-nums`}
      >
        {formatRand(metric.total, "Unavailable")}
      </p>
      {metric.total === null ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Known subtotal: {formatRand(metric.known_subtotal)}
        </p>
      ) : null}
    </>
  );
}

export function BudgetOrganisationOutlook({
  insights,
  unbudgetedCount = 0,
}: {
  insights?: BudgetInsights | null;
  unbudgetedCount?: number;
}) {
  if (!insights)
    return (
      <p
        role="status"
        className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground"
      >
        Organisation totals are unavailable for this publication. Department
        projections remain available below.
      </p>
    );
  const { projected, budget, actual, variance_all } = insights.organisation;
  const variance = variance_all.total;
  const direction =
    variance === null
      ? "Projected variance unavailable"
      : variance === "0.00"
        ? "Projected on budget"
        : variance.startsWith("-")
          ? "Projected below budget"
          : "Projected above budget";
  const varianceTone =
    variance === null || variance === "0.00"
      ? "text-muted-foreground"
      : variance.startsWith("-")
        ? "text-[#1D4ED8] dark:text-blue-300"
        : "text-[#C81E3C] dark:text-rose-300";
  return (
    <div
      className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:p-5"
      aria-label="Organisation year-end outlook"
    >
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Projected year-end expenditure
        </p>
        <p className="mb-1 text-xs text-muted-foreground">
          Budget lines · All funds
        </p>
        <MetricAmount metric={projected} prominent />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:border-l sm:pl-5">
        <div>
          <p className="text-xs text-muted-foreground">Annual budget</p>
          <MetricAmount metric={budget} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            Actual against budget lines
          </p>
          <MetricAmount metric={actual} />
        </div>
      </div>
      <div
        className={`border-t pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 ${varianceTone}`}
      >
        <p className="text-xs">{direction}</p>
        <MetricAmount metric={variance_all} />
        <p className="mt-1 text-xs text-muted-foreground">
          Across budget lines
        </p>
      </div>
      {unbudgetedCount > 0 ? (
        <p
          role="status"
          className="border-t pt-3 text-sm text-muted-foreground sm:col-span-3"
        >
          Spending outside mapped budget lines is included in the spending mix
          below; it is not part of this projection.
        </p>
      ) : null}
    </div>
  );
}
