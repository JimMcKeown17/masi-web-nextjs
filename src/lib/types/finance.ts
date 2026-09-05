// Hand-written from masi-finance schema 1.0.0 (src/lib/finance/finance-snapshot-1.0.0.json).
// Money is a decimal string with two places ("5500.00"); never a number.

export type Money = string;

export type CompletenessCode = "UNBOUND_ALLOCATION" | "ASSERTED_LINE" | "MISSING_BUDGET";

export interface CompletenessReason {
  code: CompletenessCode;
  line_id?: string;
  amount?: Money;
}

export interface FinanceLine {
  line_id: string;
  sheet_row: number;
  category: string | null;
  budget: Money | null;
  binding: "derived" | "asserted";
  key_column: string | null;
  key_column_letter: string | null;
  category_column_letter: string | null;
  amount_column_letter: string | null;
  key_values: string[];
  allocated_lifetime: Money | null;
  allocated_in_year: Money | null;
  allocated_asserted: Money | null;
  allocated_cached: Money | null;
  row_count: number | null;
  row_count_in_year: number | null;
}

export interface FunderContract {
  id: string;
  contract_code: string | null;
  block_label: string;
  period_label: string | null;
  sheet_row: number;
  in_scope_year: boolean;
  row_count_in_year: number;
  budget_total: Money | null;
  allocated_total_lifetime: Money;
  allocated_total_in_year: Money;
  remaining: Money | null;
  unbound_allocated_lifetime: Money;
  unbound_allocated_in_year: Money;
  complete: boolean;
  completeness_reasons: CompletenessReason[];
  lines: FinanceLine[];
}

export interface AllocationCoverage {
  category_2: string | null;
  category_2_variants: string[];
  spend: Money;
  funded: Money;
  unfunded: Money;
  by_contract: Record<string, Money>;
  unbound_allocated: Money;
  unbound_row_count: number;
  complete: boolean;
  completeness_reasons: CompletenessReason[];
}

export type FindingCode =
  | "TEXT_DATE"
  | "MISSING_CONTRACT_PERIOD"
  | "ORPHAN_CONTRACT_CODE"
  | "PARSER_WARNING"
  | "ORPHAN_CONTRACT_KEY"
  | "WHITESPACE_KEY"
  | "STALE_CACHED_SPENT"
  | "OVER_ALLOCATED_COVERAGE"
  | "OVER_ALLOCATED_ROW"
  | "ASSERTED_LINE"
  | "MISSING_BUDGET"
  | "CATEGORY_NOT_IN_BLOCK"
  | "MISSING_CONTRACT_KEY"
  | "UNSCANNED_FUNDER_AMOUNT";

export type Severity = "error" | "warn" | "info";

export interface Finding {
  code: FindingCode;
  severity: Severity;
  in_scope_year: boolean;
  contract_id: string | null;
  line_id: string | null;
  key_column: string | null;
  key_value: string | null;
  category: string | null;
  category_2: string | null;
  sheet_row: number | null;
  amount: Money | null;
  amount_in_year: Money | null;
  message: string;
}

export interface SnapshotSource {
  workbook_name: string;
  workbook_date: string;
  sha256: string;
  size_bytes: number;
  modified_at: string;
}

export interface FinanceSnapshot {
  schema_version: "1.0.0" | "1.1.0";
  run_id: string;
  published_at: string;
  payload_sha256: string;
  accounting_year: number;
  source: SnapshotSource;
  funder_contracts: FunderContract[];
  allocation_coverage: AllocationCoverage[];
  allocation_coverage_caveats: CompletenessReason[];
  findings: Finding[];
}

// GET /finance/snapshot/ (Django, IsFinanceReader)
export interface FinanceSnapshotResponse {
  accounting_year: number;
  run_id: string;
  workbook_name: string;
  workbook_date: string;
  workbook_modified_at: string;
  workbook_sha256: string;
  published_at: string;
  loaded_at: string;
  available_years: number[];
  snapshot: FinanceSnapshot;
}
