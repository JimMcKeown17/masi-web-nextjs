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
  const params = new URLSearchParams({ kind: "funders" });
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
export async function uploadFinanceRun(token: string, file: File, year: number): Promise<FinanceUploadResult> {
  const params = new URLSearchParams({ kind: "funders", year: String(year), source_name: file.name });
  if (Number.isFinite(file.lastModified)) params.set("client_modified_at", new Date(file.lastModified).toISOString());
  const response = await fetch(`${API_URL}/finance/runs/?${params}`, {
    method: "POST", cache: "no-store", body: file,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": XLSX_CONTENT_TYPE },
  });
  if (response.status === 201 || response.status === 200) return { status: response.status, run: await response.json() as FinanceRun };
  const error = await errorBody(response);
  if (response.status === 409 || response.status === 400) return { status: response.status, error };
  throw new FinanceRunApiError(response.status, error.code, error.detail);
}
