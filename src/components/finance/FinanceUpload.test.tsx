import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { validateFinanceFile, UploadStatus, ApprovalFields, approvalReady, requirementsAfterError } from "./FinanceUpload";
import { FinanceRunSummary } from "./FinanceRunSummary";
import { runFixture } from "./financeRunTestFixture";

test("client rejects wrong extensions, empty files and files above 32 MiB before upload", () => {
  assert.match(validateFinanceFile({ name: "data.csv", size: 10 })!, /xlsx/);
  assert.match(validateFinanceFile({ name: "data.xlsx", size: 33554433 })!, /32 MiB/);
  assert.match(validateFinanceFile({ name: "data.xlsx", size: 0 })!, /empty/);
  assert.equal(validateFinanceFile({ name: "data.XLSX", size: 33554432 }), null);
});

test("upload outcomes distinguish candidate, failed, replay, conflict and accessible progress/errors", () => {
  const cases = [
    ["uploading", "Uploading and processing", /role="status"/, /<progress/],
    ["success", "Candidate created", /Candidate created/, /role="status"/],
    ["success", "Idempotent replay", /Idempotent replay/, /role="status"/],
    ["error", "UPLOAD_IN_PROGRESS", /UPLOAD_IN_PROGRESS/, /role="alert"/],
    ["error", "Failed run", /Failed run/, /role="alert"/],
  ] as const;
  for (const [state, message, a, b] of cases) {
    const html = renderToStaticMarkup(<UploadStatus state={state} message={message} />);
    assert.match(html, a); assert.match(html, b);
  }
});

test("confirmation separates API-required acknowledgement and rollback override and requires notes", () => {
  const none = { acknowledge_findings: false, override_anti_rollback: false };
  const ack = requirementsAfterError(none, "FINDINGS_ACKNOWLEDGEMENT_REQUIRED");
  const both = requirementsAfterError(ack, "ANTI_ROLLBACK");
  assert.deepEqual(ack, { acknowledge_findings: true, override_anti_rollback: false });
  const options = { ...none, note: "" };
  const render = (required: typeof none) => renderToStaticMarkup(<ApprovalFields action="approve" requirements={required} options={options} onChange={() => {}} />);
  assert.doesNotMatch(render(none), /type="checkbox"/);
  assert.match(render(ack), /Acknowledge in-scope findings/);
  assert.doesNotMatch(render(ack), /Override anti-rollback/);
  assert.match(render(both), /Override anti-rollback/);
  assert.equal(approvalReady("approve", none, options), true);
  assert.equal(approvalReady("approve", ack, { ...options, acknowledge_findings: true }), false);
  assert.equal(approvalReady("approve", ack, { ...options, acknowledge_findings: true, note: "Reviewed" }), true);
  assert.equal(approvalReady("approve", both, { ...options, acknowledge_findings: true, note: "Reviewed" }), false);
  assert.equal(approvalReady("demote", none, options), false);
  assert.equal(approvalReady("demote", none, { ...options, note: "Restore predecessor" }), true);
});

test("summary exposes re-approval, checked demotion and failed terminal state", () => {
  const render = (run: ReturnType<typeof runFixture>, currentId?: string) => renderToStaticMarkup(<FinanceRunSummary run={run} currentId={currentId} onAction={() => {}} />);
  assert.match(render(runFixture({ status: "superseded" })), /Re-approve/);
  assert.doesNotMatch(render(runFixture({ status: "failed", payload: null, allowed_actions: [], failure: { code: "INVALID_XLSX", phase: "parse", message: "Invalid workbook" } })), />Approve</);
  assert.match(render(runFixture({ id: "current", status: "approved", previous_approved: "import", allowed_actions: ["demote"] }), "current"), /Demote/);
  assert.doesNotMatch(render(runFixture({ status: "approved", previous_approved: null, allowed_actions: ["demote"] })), />Demote</);
});

test("summary shows provenance, measurements and findings separated by severity and scope", () => {
  const findings = (["error", "warn", "info"] as const).flatMap((severity) => [true, false].map((in_scope_year) => ({ code: "PARSER_WARNING", severity, in_scope_year, message: `Finding-${severity}-${in_scope_year}`, source: "Contract Key", sheet_row: 12 })));
  const run = runFixture({ payload: { findings }, finding_count: 6 });
  const html = renderToStaticMarkup(<FinanceRunSummary run={run} currentRun={runFixture({ id: "current", status: "approved" })} currentId="current" onAction={() => {}} />);
  for (const label of ["Candidate source", "Current approved source", "SHA-256", "0.2.0", "2.0.0", "100 ms", "200 ms", "1000 bytes", "Ledger rows", "Allocations", "Outside 2026", "Contract Key"]) assert.ok(html.includes(label), label);
  for (const finding of findings) assert.ok(html.includes(finding.message));
});

test("confirmation marks the note required for demotion and checked guard options", () => {
  const options = { acknowledge_findings: false, override_anti_rollback: false, note: "" };
  const html = renderToStaticMarkup(<ApprovalFields action="demote" requirements={options} options={options} onChange={() => {}} />);
  assert.match(html, /<textarea[^>]*required=""/);
  const ackHtml = renderToStaticMarkup(<ApprovalFields action="approve" requirements={{ ...options, acknowledge_findings: true }} options={{ ...options, acknowledge_findings: true }} onChange={() => {}} />);
  assert.match(ackHtml, /<textarea[^>]*required=""/);
});

// Use the locally installed DOM harness; no package installation or browser/network needed.
import { createRequire } from "node:module";
const localRequire = createRequire(import.meta.url);
const { build } = createRequire(localRequire.resolve("tsx"))("esbuild");
const { JSDOM } = localRequire(localRequire.resolve("jsdom", { paths: [process.cwd(), process.env.JSDOM_MODULE_ROOT ?? "/usr/local/lib/node_modules/flowise"] }));

async function publicationInteraction(action: "approve" | "demote", failure = "") {
  const { outputFiles } = await build({
    stdin: { contents: `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { FinanceUploadSession } from './src/components/finance/FinanceUpload';
import { useFinanceSnapshot } from './src/components/finance/useFinanceSnapshot';
import { financeSnapshotCacheKey } from './src/lib/api/finance';
import { runFixture } from './src/components/finance/financeRunTestFixture';
const action = ${JSON.stringify(action)}, failure = ${JSON.stringify(failure)};
const cache = new Map();
let changed = false, failReads = Boolean(failure), readerRequests = 0;
const requests = [];
const old = runFixture({id:'old-run', status:'approved', previous_approved:'predecessor', allowed_actions:['demote']});
const candidate = runFixture();
const replacement = runFixture({id:'verified-current',status:'approved'});
const selected = action === 'approve' ? candidate : old;
const json = (data, status=200) => Promise.resolve(new Response(JSON.stringify(data), {status}));
window.fetch = async (input, init) => {
  const url = String(input), method = init?.method ?? 'GET';
  requests.push({url, method});
  if (method === 'POST') { changed = true; return json({...selected,status:action === 'approve' ? 'approved' : 'superseded'}); }
  if (url.includes('/snapshot/')) { readerRequests++; return new Promise(() => {}); }
  const resource = url.includes('/current/') ? 'current' : url.includes('/runs/?') ? 'list' : 'detail';
  if (changed && failReads && resource === failure) return json({detail:'Injected refresh failure'},503);
  if (resource === 'current') return json({runs:{funders:changed ? replacement : old},compatible:true});
  if (resource === 'list') return json({results:[selected,old],next:null,previous:null});
  return json(url.includes('verified-current') ? replacement : url.includes('old-run') ? old : candidate);
};
const pause = () => new Promise(resolve => setTimeout(resolve, 5));
async function until(fn, label) { for(let i=0;i<150;i++) { if(fn()) return; await pause(); } throw new Error('Timed out: '+label); }
function check(value, label) { if(!value) throw new Error(label); }
function button(label) { return [...document.querySelectorAll('button')].find(e=>e.textContent===label); }
function Reader({year}) { const {data,isLoading} = useFinanceSnapshot(year); return <p data-reader>{data ? data.figures : isLoading ? 'Reader loading' : 'Reader empty'}</p>; }
const config = {provider:()=>cache,revalidateOnFocus:false,shouldRetryOnError:false,dedupingInterval:0};
const root = createRoot(document.getElementById('root'));
const render = reader => root.render(<SWRConfig value={config}>{reader ? <><Reader/><Reader year={2026}/></> : <FinanceUploadSession userId="review-account" getToken={async()=> 'token'}/>}</SWRConfig>);
window.result = (async()=>{
 try {
  // Mount then unmount readers so these are genuinely inactive, previously visited keys.
  for (const year of [undefined,2026]) cache.set(financeSnapshotCacheKey('review-account',year), {data:{figures:'SUPERSEDED FIGURES'}});
  cache.set(financeSnapshotCacheKey('other-account'),{data:{figures:'OTHER ACCOUNT'}});
  render(true);
  await until(()=>document.body.textContent.includes('SUPERSEDED FIGURES'),'seeded reader');
  render(false);
  await until(()=>document.querySelectorAll('select')[1]?.options.length > 1,'run list');
  const select = document.querySelectorAll('select')[1]; select.value=selected.id; select.dispatchEvent(new Event('change',{bubbles:true}));
  await until(()=>button(action==='approve'?'Approve':'Demote'),'action');
  button(action==='approve'?'Approve':'Demote').click();
  await until(()=>document.querySelector('[role="dialog"]'),'dialog');
  if(action==='demote') {
    const note=document.querySelector('textarea');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(note,'Restore predecessor');
    note.dispatchEvent(new Event('input',{bubbles:true})); await pause();
  }
  button(action==='approve'?'Confirm approval':'Confirm demotion').click();
  await until(()=>changed && !document.querySelector('[role="dialog"]'),'change completed');
  if(failure) {
    check(!document.body.textContent.includes('Approved server state refreshed'),'Must not announce refreshed state after failed '+failure+' GET');
    check(document.body.textContent.includes('Change succeeded, refresh pending'),'Must report change succeeded, refresh pending');
    const before = requests.length; failReads=false;
    button('Retry refresh').click();
    await until(()=>document.body.textContent.includes('Approved server state refreshed'),'read-only retry');
    check(requests.slice(before).length > 0 && requests.slice(before).every(r=>r.method==='GET'),'Retry must issue GETs only');
    for(const path of ['/current/','/runs/?','/runs/']) check(requests.slice(before).some(r=>r.url.includes(path)),'Retry must verify '+path);
  }
  const announcement = document.body.textContent;
  const beforeReaders = readerRequests;
  render(true);
  await until(()=>document.querySelector('[data-reader]'),'reader remount');
  check(!document.body.textContent.includes('SUPERSEDED FIGURES'),'Superseded figures must be absent while replacement GET is pending');
  check([...document.querySelectorAll('[data-reader]')].every(e=>e.textContent==='Reader loading'),'Reader must show loading');
  await until(()=>readerRequests>beforeReaders,'replacement snapshot GET');
  check(cache.get(financeSnapshotCacheKey('other-account')).data.figures==='OTHER ACCOUNT','Other account cache must survive');
  check(requests.filter(r=>r.method==='POST').length===1,'Mutation must occur exactly once');
  check(announcement.includes('Current run: verified-current.'),'Announcement must name the verified current response');
 } finally { root.unmount(); }
})();
`, resolveDir: process.cwd(), loader: "tsx" }, bundle: true, write: false, platform: "browser", jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_API_URL": '""' },
    plugins: [{ name: "test-host-auth", setup(plugin: { onResolve: (options: unknown, callback: (args: { path: string }) => unknown) => void; onLoad: (options: unknown, callback: () => unknown) => void }) {
      plugin.onResolve({ filter: /^(@clerk\/nextjs|@\/components\/providers\/UserProvider)$/ }, (args) => ({ path: args.path, namespace: "test-auth" }));
      plugin.onLoad({ filter: /.*/, namespace: "test-auth" }, () => ({ contents: `export const useAuth=()=>({userId:'review-account',isLoaded:true,getToken:async()=> 'token'}); export const useUser=()=>null;` }));
    } }],
  });
  const dom = new JSDOM('<div id="root"></div>', { runScripts: "outside-only", pretendToBeVisual: true, url: "https://test.invalid" });
  dom.window.Response = Response;
  try { dom.window.eval(outputFiles[0].text); await dom.window.result; }
  finally { dom.window.close(); }
}
for (const action of ["approve", "demote"] as const) {
  test(`${action} clears inactive account snapshots before delayed reader remount`, () => publicationInteraction(action));
  for (const resource of ["current", "list", "detail"]) {
    test(`${action}: failed post-mutation ${resource} GET reports pending and retries reads only`, () => publicationInteraction(action, resource));
  }
}
