import type {
  BudgetInsights,
  BudgetInsightMetric,
} from "@/lib/types/finance-budgets";

/** Synthetic API response values for UI tests, never used by production components. */
export function budgetInsightsFixture(): BudgetInsights {
  const metric = (total: string): BudgetInsightMetric => ({
    total,
    known_subtotal: total,
    complete: true,
    residual: "0.00",
    part_refs: [{ ref: "/derived/hierarchy/0", sign: 1 }],
  });
  return {
    version: "1.0.0",
    run_id: "approved-budget",
    ledger_run_id: "00000000-0000-4000-8000-000000000001",
    accounting_year: 2026,
    sheet_as_of: "2026-07-15",
    outlook: {expected_income: "14.60", budgeted_balance: "-0.05", projected_masi_balance: "-0.03", income_reason: null, income_source: "2026 Expected Income!J53"},
    organisation: {
      budget: metric("14.65"),
      actual: metric("9.75"),
      projected: metric("14.63"),
      variance_all: metric("-0.03"),
      variance_masi: metric("-0.02"),
    },
    composition: {
      total: "9.77",
      available: true,
      reasons: [],
      buckets: [
        {
          id: "2026-4",
          label: "Department A",
          amount: "9.75",
          percentage: "99.795292",
        },
        {
          id: "unbudgeted",
          label: "Unbudgeted / unmapped expenditure",
          amount: "0.02",
          percentage: "0.204708",
        },
      ],
      residual: "0.00",
    },
  };
}
