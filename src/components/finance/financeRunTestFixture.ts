import type { FinanceRun } from "@/lib/types/finance-runs";
export function runFixture(overrides: Partial<FinanceRun> = {}): FinanceRun {
  return {
    id: "candidate-id", kind: "funders", accounting_year: 2026, status: "candidate",
    source_name: "20260901 Masi.xlsx", source_date: "2026-09-01", source_sha256: "a".repeat(64), source_size_bytes: 100,
    schema_version: "2.0.0", producer_version: "0.2.0", payload_sha256: "b".repeat(64), facts_sha256: "c".repeat(64),
    uploaded_by: 1, uploaded_at: "2026-09-05T10:00:00Z", approved_by: null, approved_at: null, previous_approved: null,
    approval_overrode_rollback: false, approval_acknowledged_findings: false, approval_note: "",
    demoted_by: null, demoted_at: null, demotion_note: "", parse_duration_ms: 100, total_duration_ms: 200,
    peak_memory_bytes: 1000, fact_row_count: 5, allocation_count: 6, finding_count: 0, in_scope_error_count: 0,
    manifest: { producer: { name: "masi-finance", version: "0.2.0" }, source: { name: "20260901 Masi.xlsx", date: "2026-09-01", sha256: "a".repeat(64), size_bytes: 100, client_modified_at: null }, accounting_year: 2026, dependencies: [], rule_config_sha256: null },
    payload: { findings: [] }, failure: null, allowed_actions: ["approve"], ...overrides,
  };
}
