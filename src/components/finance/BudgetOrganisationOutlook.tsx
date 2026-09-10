import type { BudgetInsights } from "@/lib/types/finance-budgets";
import { formatRand } from "@/lib/finance/money";

function Headline({ label, value, description, balance = false, missingLabel = "Awaiting income forecast" }: {
  label: string; value: string | null | undefined; description: string; balance?: boolean; missingLabel?: string;
}) {
  const known = value != null;
  const negative = known && value.startsWith("-");
  const zero = known && /^-?0\.0+$/.test(value);
  return <div className="min-w-0 p-4 sm:p-5">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-2 break-words font-serif text-2xl tabular-nums xl:text-3xl ${balance && known && !zero ? negative ? "text-[#C81E3C] dark:text-rose-300" : "text-[#1D4ED8] dark:text-blue-300" : ""}`}>
      {known ? formatRand(value) : <span className="font-sans text-base text-muted-foreground">{label === "Annual Budget" ? "Needs budget input" : missingLabel}</span>}
    </p>
    {balance && known ? <p className="mt-1 text-sm font-medium">{zero ? "Balanced" : negative ? "Shortfall" : "Surplus"}</p> : null}
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
  </div>;
}

export function BudgetOrganisationOutlook({ insights, unbudgetedCount = 0 }: {
  insights?: BudgetInsights | null; unbudgetedCount?: number;
}) {
  if (!insights) return <p role="status" className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">Organisation totals could not be loaded for this import. Reload the page to try again. Department comparisons remain below.</p>;
  const outlook = insights.outlook;
  return <div aria-label="Organisation year-end outlook" className="overflow-hidden rounded-xl border bg-card">
    <div className="grid divide-y sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 [&>div]:border-border sm:[&>div:nth-child(even)]:border-l xl:[&>div+div]:border-l">
      <Headline label="Annual Budget" value={insights?.organisation.budget.total} description="Planned expenditure for the year" />
      <Headline label="Expected Income" value={outlook?.expected_income} description="The workbook’s Expected Value forecast" />
      <Headline label="Budgeted Surplus/Shortfall" value={outlook?.budgeted_balance} missingLabel={outlook?.expected_income != null ? "Needs budget input" : undefined} balance description="Expected income less annual budget" />
      <Headline label="Projected Surplus/Shortfall" value={outlook?.projected_masi_balance} missingLabel={outlook?.expected_income != null ? "Needs budget or expense input" : undefined} balance description="Budgeted balance adjusted for Masi overspend or underspend" />
    </div>
    {!outlook || outlook.income_reason ? <p role="status" className="border-t bg-muted/25 px-4 py-3 text-sm sm:px-5">
      {!outlook || outlook.income_reason === "not_imported" ? "This approved import does not contain Expected Income. Refresh the budget and approve the new import to populate the income and surplus cards." : "The income forecast needs attention in the budget workbook. Check the Expected Income total and its Expected Value entries, then refresh and approve the budget."}
    </p> : null}
    <p className="border-t px-4 py-3 text-xs leading-relaxed text-muted-foreground sm:px-5">Projected surplus assumes projects excluded from the Masi comparison finish at budget. It is a planning forecast, not a cash balance.
      {unbudgetedCount > 0 ? " Spending without a mapped budget line is shown in the spending mix below and is outside this forecast." : ""}
    </p>
  </div>;
}
