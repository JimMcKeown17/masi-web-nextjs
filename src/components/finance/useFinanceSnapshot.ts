"use client";

import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";

import { financeSnapshotCacheKey, getFinanceSnapshot } from "@/lib/api/finance";

export function useFinanceSnapshot(year?: number) {
  const { getToken, userId, isLoaded } = useAuth();
  const swr = useSWR(isLoaded ? financeSnapshotCacheKey(userId, year) : null, async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    return getFinanceSnapshot(token, year);
  });
  // Fail closed: never hand back a snapshot alongside an error.
  return { ...swr, data: swr.error ? undefined : swr.data };
}
