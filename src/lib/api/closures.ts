// API client for the closure-calendar endpoints (Masi backend, ADMIN/PM only).
// NEXT_PUBLIC_API_URL already ends in /api, so paths are /closures..., not /api/closures.
import type {
  SchoolClosure,
  StaffAbsence,
  ClosureLookups,
  ClosureBulkBody,
  AbsenceBulkBody,
} from "@/lib/types/closures";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = `(${res.status})`;
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* non-JSON error body */
    }
    throw new Error(`${path} failed ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function withWindow(path: string, dateFrom?: string, dateTo?: string): string {
  const q = new URLSearchParams();
  if (dateFrom) q.set("date_from", dateFrom);
  if (dateTo) q.set("date_to", dateTo);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

// Lookups for the form dropdowns
export function getClosureLookups(token: string) {
  return request<ClosureLookups>("/closures/lookups/", token);
}

// School closures
export function listClosures(token: string, dateFrom?: string, dateTo?: string) {
  return request<SchoolClosure[]>(withWindow("/closures/", dateFrom, dateTo), token);
}

export function bulkCreateClosures(token: string, body: ClosureBulkBody) {
  return request<{ created: number; updated: number }>("/closures/bulk/", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteClosure(token: string, id: number) {
  return request<void>(`/closures/${id}/`, token, { method: "DELETE" });
}

// Staff absences
export function listAbsences(token: string, dateFrom?: string, dateTo?: string) {
  return request<StaffAbsence[]>(withWindow("/absences/", dateFrom, dateTo), token);
}

export function bulkCreateAbsences(token: string, body: AbsenceBulkBody) {
  return request<{ created: number; updated: number }>("/absences/bulk/", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteAbsence(token: string, id: number) {
  return request<void>(`/absences/${id}/`, token, { method: "DELETE" });
}
