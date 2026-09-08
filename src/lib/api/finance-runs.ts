import type { ApprovalOptions, FinanceCurrent, FinanceRun, FinanceRunErrorBody, FinanceRunFilters, FinanceRunsPage, FinanceUploadResult } from "@/lib/types/finance-runs";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export class FinanceRunApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "FinanceRunApiError";
  }
}
export function financeRunsCacheKey(userId: string | null | undefined, resource: string): string | null {
  return userId ? `/operations/finance/runs?user=${encodeURIComponent(userId)}&resource=${encodeURIComponent(resource)}` : null;
}
async function errorBody(response: Response): Promise<FinanceRunErrorBody> {
  const body = await response.json().catch(() => ({}));
  return { code: typeof body.code === "string" ? body.code : `HTTP_${response.status}`, detail: typeof body.detail === "string" ? body.detail : `Finance request failed (${response.status})` };
}
async function request<T>(token: string, path: string, options?: ApprovalOptions): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(options ? { "Content-Type": "application/json" } : {}) },
    ...(options ? { method: "POST", body: JSON.stringify({ override_anti_rollback: options.override_anti_rollback, acknowledge_findings: options.acknowledge_findings, note: options.note }) } : {}),
  });
  if (!response.ok) {
    const body = await errorBody(response);
    throw new FinanceRunApiError(response.status, body.code, body.detail);
  }
  return response.json() as Promise<T>;
}
export function getFinanceRuns(token: string, filters: FinanceRunFilters = {}): Promise<FinanceRunsPage> {
  const params = new URLSearchParams({ kind: filters.kind ?? "funders" });
  if (filters.year !== undefined) params.set("year", String(filters.year));
  if (filters.status) params.set("status", filters.status);
  if (filters.cursor) params.set("cursor", filters.cursor);
  return request(token, `/finance/runs/?${params}`);
}
export function getFinanceRun(token: string, id: string): Promise<FinanceRun> {
  return request(token, `/finance/runs/${encodeURIComponent(id)}/`);
}
export function getFinanceCurrent(token: string, year: number): Promise<FinanceCurrent> {
  return request(token, `/finance/current/?year=${year}`);
}
export function approveFinanceRun(token: string, id: string, options: ApprovalOptions): Promise<FinanceRun> {
  return request(token, `/finance/runs/${encodeURIComponent(id)}/approve/`, options);
}
export function demoteFinanceRun(token: string, id: string, options: ApprovalOptions): Promise<FinanceRun> {
  return request(token, `/finance/runs/${encodeURIComponent(id)}/demote/`, options);
}
export async function uploadFinanceRun(token: string, file: File, year: number, selection: { kind: "funders" } | { kind: "budgets"; ledgerRunId: string } = { kind: "funders" }): Promise<FinanceUploadResult> {
  const params = new URLSearchParams({ kind: selection.kind, year: String(year), source_name: file.name });
  if (selection.kind === "budgets") params.set("ledger_run_id", selection.ledgerRunId);
  if (Number.isFinite(file.lastModified)) params.set("client_modified_at", new Date(file.lastModified).toISOString());
  const response = await fetch(`${API_URL}/finance/runs/?${params}`, {
    method: "POST", cache: "no-store", body: file,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": XLSX_CONTENT_TYPE },
  });
  return uploadResult(response);
}
export async function pullFinanceBudget(token: string, year: number, ledgerRunId: string): Promise<FinanceUploadResult> {
  const response = await fetch(`${API_URL}/finance/runs/pull-budget/`, {
    method: "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ year, ledger_run_id: ledgerRunId }),
  });
  return uploadResult(response);
}
async function uploadResult(response: Response): Promise<FinanceUploadResult> {
  if (response.status === 201 || response.status === 200) return { status: response.status, run: await response.json() as FinanceRun };
  const error = await errorBody(response);
  if (response.status === 409 || response.status === 400) return { status: response.status, error };
  throw new FinanceRunApiError(response.status, error.code, error.detail);
}

// Follow only the cursor, retaining the authenticated API origin and all filters.
export function financePageCursor(url: string | null): string | undefined {
  return url ? new URL(url, "https://pagination.invalid").searchParams.get("cursor") ?? undefined : undefined;
}
export async function getBudgetLedgerDependencies(getToken: () => Promise<string>, year: number) {
  const results: import("@/lib/types/finance-runs").FinanceRunMetadata[] = [];
  const seen = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await getFinanceRuns(await getToken(), {kind:"funders", year, status:"approved", cursor});
    results.push(...page.results.filter(run => run.kind === "funders" && run.status === "approved" && run.accounting_year === year && run.schema_version === "2.0.0" && Boolean(run.facts_sha256)));
    cursor = financePageCursor(page.next);
    if (page.next && (!cursor || seen.has(cursor))) throw new Error("Invalid ledger pagination. Retry loading dependencies.");
    if (cursor) seen.add(cursor);
  } while (cursor);
  return results;
}
export interface FinanceRowsFilters { year: number; bc: string; cursor?: string }
function rowsParams(filters: FinanceRowsFilters) {
  const params = new URLSearchParams({year:String(filters.year), bc:filters.bc});
  if (filters.cursor) params.set("cursor", filters.cursor);
  return params;
}
export function getFinanceRunRows(token: string, id: string, filters: FinanceRowsFilters): Promise<import("@/lib/types/finance-budgets").FinanceRowsPage> {
  return request(token, `/finance/runs/${encodeURIComponent(id)}/rows/?${rowsParams(filters)}`);
}
export async function exportFinanceRunRows(token: string, id: string, filters: Omit<FinanceRowsFilters,"cursor">, format: "csv" | "xlsx"): Promise<Blob> {
  const params = rowsParams({year:filters.year,bc:filters.bc}); params.set("format",format);
  const response = await fetch(`${API_URL}/finance/runs/${encodeURIComponent(id)}/rows/export/?${params}`, {cache:"no-store",headers:{Authorization:`Bearer ${token}`}});
  if (!response.ok) { const error = await errorBody(response); throw new FinanceRunApiError(response.status,error.code,error.detail); }
  return response.blob();
}
