import type { Finding, FinanceSnapshot } from "./finance";

export type FinanceRunStatus = "candidate" | "approved" | "superseded" | "failed";
export type FinanceRunAction = "approve" | "demote";
export interface FinanceRunMetadata {
  id: string;
  kind: "funders";
  accounting_year: number;
  status: FinanceRunStatus;
  source_name: string;
  source_date: string;
  source_sha256: string;
  source_size_bytes: number;
  schema_version: "1.0.0" | "2.0.0";
  producer_version: string | null;
  payload_sha256: string | null;
  facts_sha256: string | null;
  uploaded_by: number;
  uploaded_at: string;
  approved_by: number | null;
  approved_at: string | null;
  previous_approved: string | null;
  approval_overrode_rollback: boolean;
  approval_acknowledged_findings: boolean;
  approval_note: string;
  demoted_by: number | null;
  demoted_at: string | null;
  demotion_note: string;
  parse_duration_ms: number;
  total_duration_ms: number;
  peak_memory_bytes: number;
  fact_row_count: number;
  allocation_count: number;
  finding_count: number;
  in_scope_error_count: number;
}
export interface FinanceRunManifest {
  producer: { name: string; version: string | null };
  source: { name: string; date: string; sha256: string; size_bytes: number; client_modified_at: string | null };
  accounting_year: number;
  rule_config_sha256: string | null;
  dependencies: { kind: string; source_sha256?: string }[];
}
// Run findings retain source metadata and canonical identities, unlike snapshot bindings.
export interface FinanceRunFinding {
  code: string;
  severity: Finding["severity"];
  in_scope_year: boolean;
  message: string;
  sheet_row?: number | null;
  contract_id?: string | null;
  source?: unknown;
}
export interface FinanceRun extends FinanceRunMetadata {
  manifest: FinanceRunManifest;
  payload: { findings: FinanceRunFinding[] } | FinanceSnapshot | null;
  failure: { code: string; phase: string; message: string } | null;
  allowed_actions: FinanceRunAction[];
}
export interface FinanceRunsPage {
  results: FinanceRunMetadata[];
  next: string | null;
  previous: string | null;
}
export interface FinanceRunFilters {
  year?: number;
  status?: FinanceRunStatus;
  cursor?: string;
}
export interface ApprovalOptions {
  override_anti_rollback: boolean;
  acknowledge_findings: boolean;
  note: string;
}
export interface CurrentRun {
  id: string;
  source_sha256: string;
  management_accounts_sha256: string | null;
  schema_version: string;
  approved_at: string;
}
export interface FinanceCurrent {
  accounting_year: number;
  runs: Record<string, CurrentRun>;
  compatible: boolean;
  compatibility_reason: { code: string; runs: Record<string, CurrentRun> } | null;
}
export interface FinanceRunErrorBody { code: string; detail: string }
export type FinanceUploadResult =
  | { status: 201; run: FinanceRun }
  | { status: 200; run: FinanceRun }
  | { status: 409; error: FinanceRunErrorBody }
  | { status: 400; error: FinanceRunErrorBody };
