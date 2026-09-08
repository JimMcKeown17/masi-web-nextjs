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

test("budget raw upload binds its exact ledger dependency and kind", async () => {
  const original = global.fetch;
  const file = new File(["synthetic"], "budget.xlsx");
  global.fetch = async (url, init) => {
    const params = new URL(String(url), "https://test.invalid").searchParams;
    assert.equal(params.get("kind"), "budgets");
    assert.equal(params.get("ledger_run_id"), "ledger +/one");
    assert.equal(init?.body, file);
    return new Response('{}', {status:201});
  };
  try { await uploadFinanceRun("token", file, 2026, {kind:"budgets", ledgerRunId:"ledger +/one"}); }
  finally { global.fetch = original; }
});

test("budget list, paginated eligible dependencies and contributor exports preserve filters and auth", async () => {
  const api = await import("./finance-runs");
  const original = global.fetch;
  const calls: URL[] = [];
  global.fetch = async (url, init) => {
    const u = new URL(String(url), "https://backend.test"); calls.push(u);
    assert.equal((init?.headers as Record<string,string>).Authorization, "Bearer token");
    if (u.pathname.includes("export")) return new Response("export-bytes");
    if (u.pathname.includes("/rows/")) return new Response(JSON.stringify({results:[],next:null}));
    return new Response(JSON.stringify({results:[{id:u.searchParams.has("cursor") ? "second" : "first",kind:"funders",status:"approved",accounting_year:2026,schema_version:"2.0.0",facts_sha256:"facts"},{id:"factless",kind:"funders",status:"approved",accounting_year:2026,schema_version:"1.0.0",facts_sha256:null}], next:u.searchParams.has("cursor") ? null : "https://untrusted.invalid/runs/?cursor=a%2Bb%3D",previous:null}));
  };
  try {
    await getFinanceRuns("token",{kind:"budgets",year:2026});
    assert.equal(calls[0].searchParams.get("kind"),"budgets");
    assert.deepEqual((await api.getBudgetLedgerDependencies("token",2026)).map(r=>r.id),["first","second"]);
    assert.equal(calls[2].searchParams.get("cursor"),"a+b=");
    assert.equal(calls[2].host,"backend.test");
    await api.getFinanceRunRows("token","budget",{year:2026,bc:" 01 A&+ ",cursor:"c+="});
    assert.equal(calls[3].searchParams.get("bc")," 01 A&+ ");
    assert.equal(calls[3].searchParams.get("cursor"),"c+=");
    for (const format of ["csv","xlsx"] as const) {
      assert.equal(await (await api.exportFinanceRunRows("token","budget",{year:2026,bc:" 01 A&+ "},format)).text(),"export-bytes");
      assert.equal(calls.at(-1)!.searchParams.get("format"),format);
      assert.equal(calls.at(-1)!.searchParams.has("cursor"),false);
    }
  } finally { global.fetch=original; }
});
test("budget rows and exports expose 400 and 409 errors; cache identities isolate kind year and dependency",async()=>{
 const api=await import('./finance-runs');const original=global.fetch;
 try {for(const status of [400,409]) {global.fetch=async()=>new Response(JSON.stringify({code:'ROW_FILTER_INVALID',detail:'Invalid filter'}),{status});for(const operation of [()=>api.getFinanceRunRows('token','budget',{year:2026,bc:'A'}),()=>api.exportFinanceRunRows('token','budget',{year:2026,bc:'A'},'xlsx')])await assert.rejects(operation,error=>error instanceof FinanceRunApiError&&error.status===status&&error.code==='ROW_FILTER_INVALID');}
 const resources=['list:funders:2026::','list:budgets:2026::','list:budgets:2025::','dependencies:funders:2026','dependencies:funders:2025','rows:budgets:budget-pinned-A:2026:A:','rows:budgets:budget-pinned-B:2026:A:'];
 assert.equal(new Set(resources.map(resource=>financeRunsCacheKey('actor',resource))).size,resources.length);
 }finally{global.fetch=original;}
});
