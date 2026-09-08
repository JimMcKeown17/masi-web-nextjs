import type { FinanceRunFinding } from "./finance-runs";
export type BudgetMetric = "budget" | "actual" | "projected" | "variance_all" | "variance_masi";
export type BudgetValues = Record<BudgetMetric, string | null>;
export interface BudgetNode extends BudgetValues {
  id: string; sheet_row: number; label: string; parent_id: string | null;
  complete: boolean; completeness_reasons: string[];
}
export interface BudgetHierarchy extends BudgetNode {
  level: number; child_ids: string[]; line_ids: string[]; known_subtotals: BudgetValues;
}
export interface BudgetLine extends BudgetNode {
  bc: string | number | null; calc: string | null; wf: string | null;
  actual_share: string; budget_source: string; ledger_row_count: number;
  variance_masi_ref: string | null;
}
export interface BudgetFinding extends FinanceRunFinding {
  accounting_year: number; line_id: string | null; node_id: string | null;
  source_cells: string[]; bc: string | number | null;
  cached: string | null; recomputed: string | null; delta: string | null;
}
export interface BudgetPayload {
  // Exact API payload: artifact.derived, with the manifest alongside payload on FinanceRun.
    hierarchy: BudgetHierarchy[]; lines: BudgetLine[]; findings: BudgetFinding[];
    projection: {sheet_as_of: string; month_count: number; actual_basis: string; policy: string};
    lines_by_bc: {bc: string | number; line_ids: string[]; ledger_actual: string; ledger_row_count: number}[];
    summary: {complete: boolean; finding_count: number; ledger_contributor_count: number; unbound_count: number; orphan_count: number};
}
export interface FinanceLedgerRow {
  row_key: string; sheet_row: number; date: string; year: number; description: string | null;
  paid_by: string | null; category_1: string | null; category_2: string | null; category_3: string | null;
  bc: string | null; amount: string; coverage_amount: string;
}
export interface FinanceRowsPage {
  results: FinanceLedgerRow[]; next: string | null; previous: string | null;
  run_id: string; ledger_run_id: string; management_accounts_sha256: string;
  contributor_basis: "full_ledger_amount_before_budget_share";
}
