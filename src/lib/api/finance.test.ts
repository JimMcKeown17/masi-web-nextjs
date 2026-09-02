import assert from "node:assert/strict";
import test from "node:test";

import { financeSnapshotCacheKey, financeSnapshotPath, getFinanceSnapshot } from "./finance";

test("path carries the year only when given", () => {
  assert.equal(financeSnapshotPath(), "/finance/snapshot/");
  assert.equal(financeSnapshotPath(2026), "/finance/snapshot/?year=2026");
});

test("getFinanceSnapshot sends the bearer token and surfaces DRF detail on failure", async () => {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, headers: init?.headers as Record<string, string> });
    return new Response(JSON.stringify({ detail: "Finance dashboards are limited to admins and project managers." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    await assert.rejects(getFinanceSnapshot("tok", 2026), /limited to admins/);
    assert.equal(calls[0].headers.Authorization, "Bearer tok");
    assert.match(calls[0].url, /\/finance\/snapshot\/\?year=2026$/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("cache key is per user and null while there is no user", () => {
  assert.equal(financeSnapshotCacheKey("user_1", 2026), "/operations/finance/snapshot?user=user_1&year=2026");
  assert.equal(financeSnapshotCacheKey("user_1"), "/operations/finance/snapshot?user=user_1&year=latest");
  assert.equal(financeSnapshotCacheKey(null, 2026), null);
});
