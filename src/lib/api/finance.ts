// API client for the finance dashboard (Masi backend, ADMIN/PM only).
// NEXT_PUBLIC_API_URL already ends in /api, so paths are /finance/..., not /api/finance.
import type { FinanceSnapshotResponse } from "@/lib/types/finance";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function financeSnapshotPath(year?: number): string {
  return year === undefined ? "/finance/snapshot/" : `/finance/snapshot/?year=${year}`;
}

// SWR key. It carries the user id: SWR keeps the last successful `data` when a
// revalidation fails, so without it a same-tab account switch could show the
// previous user's snapshot next to a 403. Null while there is no user.
export function financeSnapshotCacheKey(userId: string | null | undefined, year?: number): string | null {
  return userId ? `/operations/finance/snapshot?user=${userId}&year=${year ?? "latest"}` : null;
}

async function getJson<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL ?? ""}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || `Failed to fetch ${path} (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function getFinanceSnapshot(token: string, year?: number): Promise<FinanceSnapshotResponse> {
  return getJson<FinanceSnapshotResponse>(financeSnapshotPath(year), token);
}
