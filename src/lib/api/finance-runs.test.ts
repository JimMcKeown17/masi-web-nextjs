import assert from "node:assert/strict";
import test from "node:test";
import { uploadFinanceRun, getFinanceRuns, getFinanceRun, getFinanceCurrent, approveFinanceRun, demoteFinanceRun, FinanceRunApiError, financeRunsCacheKey } from "./finance-runs";

test("raw XLSX upload encodes query metadata and does not cache authorization", async () => {
  const original = global.fetch;
  const file = new File(["xlsx"], "20260901 Masi & funds.xlsx", { lastModified: 1234 });
  const calls: RequestInit[] = [];
  global.fetch = async (url, init) => {
    const parsed = new URL(String(url), "https://backend.test");
    assert.equal(parsed.pathname, "/finance/runs/");
    assert.equal(parsed.searchParams.get("source_name"), file.name);
    assert.equal(parsed.searchParams.get("client_modified_at"), new Date(1234).toISOString());
    assert.equal(parsed.searchParams.get("year"), "2026");
    assert.equal(init?.body, file);
    assert.equal(init?.cache, "no-store");
    assert.deepEqual(Object.keys(init?.headers ?? {}).sort(), ["Authorization", "Content-Type"]);
    assert.equal((init?.headers as Record<string,string>)["Content-Type"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    calls.push(init!);
    return new Response(JSON.stringify({ id: "run", status: "candidate" }), { status: 201 });
  };
  try {
    assert.equal((await uploadFinanceRun("first", file, 2026)).status, 201);
    await uploadFinanceRun("second", file, 2026);
    assert.equal((calls[1].headers as Record<string,string>).Authorization, "Bearer second");
    assert.notEqual(financeRunsCacheKey("a", "list"), financeRunsCacheKey("b", "list"));
    assert.equal(financeRunsCacheKey(null, "list"), null);
  } finally { global.fetch = original; }
});

test("upload distinguishes new failed runs, replay, in-progress and stable errors", async () => {
  const original = global.fetch;
  try {
    for (const status of [201, 200, 409, 400]) {
      global.fetch = async () => new Response(JSON.stringify(status < 300 ? { id: "same", status: "failed" } : { code: status === 409 ? "UPLOAD_IN_PROGRESS" : "INVALID_XLSX", detail: "Try another file" }), { status });
      const result = await uploadFinanceRun("token", new File(["x"], "a.xlsx"), 2026);
      assert.equal(result.status, status);
      if (result.status === 200 || result.status === 201) assert.equal(result.run.status, "failed");
      else assert.equal(result.error.code, status === 409 ? "UPLOAD_IN_PROGRESS" : "INVALID_XLSX");
    }
    global.fetch = async () => new Response('{"code":"FORBIDDEN"}', { status: 403 });
    await assert.rejects(uploadFinanceRun("token", new File(["x"], "a.xlsx"), 2026), FinanceRunApiError);
  } finally { global.fetch = original; }
});

test("read and mutation clients use bounded paths and exact approval options", async () => {
  const original = global.fetch;
  const paths: string[] = [];
  global.fetch = async (url, init) => {
    paths.push(String(url));
    assert.equal(init?.cache, "no-store");
    assert.equal((init?.headers as Record<string,string>).Authorization, "Bearer token");
    if (init?.method === "POST") assert.deepEqual(JSON.parse(String(init.body)), { acknowledge_findings: true, override_anti_rollback: false, note: "Reviewed" });
    return new Response('{}');
  };
  try {
    await getFinanceRuns("token", { year: 2026, status: "candidate", cursor: "a+b=" });
    await getFinanceRun("token", "run");
    await getFinanceCurrent("token", 2026);
    const options = { acknowledge_findings: true, override_anti_rollback: false, note: "Reviewed" };
    await approveFinanceRun("token", "run", options);
    await demoteFinanceRun("token", "run", options);
    assert.match(paths[0], /cursor=a%2Bb%3D/);
    assert.match(paths[3], /run\/approve\/$/);
    assert.match(paths[4], /run\/demote\/$/);
  } finally { global.fetch = original; }
});
