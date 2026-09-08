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
const { JSDOM } = localRequire("jsdom");

async function publicationInteraction(action: "approve" | "demote", failure = "", switchAccount = false) {
  const { outputFiles } = await build({
    stdin: { contents: `
import React from 'react';
import { createRoot } from 'react-dom/client';
import useSWR, { SWRConfig } from 'swr';
import { useAuth } from '@clerk/nextjs';
import { financeRunsCacheKey, getFinanceCurrent, getFinanceRuns, getFinanceRun } from './src/lib/api/finance-runs';
import { FinanceUploadSession } from './src/components/finance/FinanceUpload';
import { useFinanceSnapshot } from './src/components/finance/useFinanceSnapshot';
import { financeSnapshotCacheKey } from './src/lib/api/finance';
import { runFixture } from './src/components/finance/financeRunTestFixture';
const action = ${JSON.stringify(action)}, failure = ${JSON.stringify(failure)}, switchAccount = ${JSON.stringify(switchAccount)};
window.account = switchAccount ? 'account-B' : 'review-account';
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
  const authorization = init?.headers?.Authorization;
  requests.push({url, method, authorization, account:window.account});
  if (switchAccount && changed && window.account === 'account-B') { if(url.includes('/snapshot/')) readerRequests++; return new Promise(() => {}); }
  if (method === 'POST') { changed = true; return json({...selected,status:action === 'approve' ? 'approved' : 'superseded'}); }
  if (url.includes('/snapshot/')) { readerRequests++; return switchAccount && !changed ? json({figures:'SUPERSEDED FIGURES'}) : new Promise(() => {}); }
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
function RunReader() {
  const {userId,getToken} = useAuth();
  const current = useSWR(financeRunsCacheKey(userId,'current:2025'),async()=>getFinanceCurrent(await getToken(),2025));
  const list = useSWR(financeRunsCacheKey(userId,'list:2025::'),async()=>getFinanceRuns(await getToken(),{year:2025}));
  const detail = useSWR(financeRunsCacheKey(userId,'detail:old-run'),async()=>getFinanceRun(await getToken(),'old-run'));
  return <p data-run-reader>{[current,list,detail].every(r=>r.data) ? 'OLD RUN STATE' : [current,list,detail].every(r=>!r.data && r.isLoading) ? 'Runs loading' : 'Runs pending'}</p>;
}
const config = {provider:()=>cache,revalidateOnFocus:false,shouldRetryOnError:false,dedupingInterval:0};
const root = createRoot(document.getElementById('root'));
const render = reader => {
  const userId = window.account;
  root.render(<SWRConfig value={config}>{reader ? <><Reader/><Reader year={2026}/>{switchAccount ? <RunReader/> : null}</> : <FinanceUploadSession key={userId} userId={userId} getToken={async()=> 'token-'+userId}/>}</SWRConfig>);
};
window.result = (async()=>{
 try {
  // Mount then unmount readers so these are genuinely inactive, previously visited keys.
  if (!switchAccount) for (const year of [undefined,2026]) cache.set(financeSnapshotCacheKey('review-account',year), {data:{figures:'SUPERSEDED FIGURES'}});
  cache.set('unrelated-cache',{data:'UNCHANGED'});
  render(true);
  await until(()=>document.body.textContent.includes('SUPERSEDED FIGURES'),'seeded reader');
  if (switchAccount) {
    await until(()=>document.body.textContent.includes('OLD RUN STATE'),'B run reads');
    check(requests.length >= 5 && requests.every(r=>r.authorization==='Bearer token-account-B'),'Initial reader requests must use B credentials');
    window.account='account-A';
  }
  const beforePublisher = requests.length;
  render(false);
  await until(()=>document.querySelector('select[aria-label=Run]')?.options.length > 1,'run list');
  const select = document.querySelector('select[aria-label=Run]'); select.value=selected.id; select.dispatchEvent(new Event('change',{bubbles:true}));
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
  const beforeReturn = requests.length;
  if (switchAccount) {
    const publishingRequests = requests.slice(beforePublisher);
    check(publishingRequests.every(r=>r.authorization==='Bearer token-account-A'),'Publisher must use A credentials only');
    check(!publishingRequests.some(r=>r.url.includes('/snapshot/') || r.url.includes('year=2025')),'Publication must not revalidate B readers with A credentials');
    window.account='account-B';
  }
  render(true);
  await until(()=>document.querySelector('[data-reader]'),'reader remount');
  check(!document.body.textContent.includes('SUPERSEDED FIGURES'),'Superseded figures must be absent while replacement GET is pending');
  check([...document.querySelectorAll('[data-reader]')].every(e=>e.textContent==='Reader loading'),'Reader must show loading');
  await until(()=>readerRequests>beforeReaders,'replacement snapshot GET');
  if (switchAccount) {
    check(document.querySelector('[data-run-reader]').textContent==='Runs loading','B mutable run caches must be cleared without publisher data');
    await until(()=>requests.slice(beforeReturn).length>=5,'B authenticated snapshot and run reads');
    check(requests.slice(beforeReturn).every(r=>r.method==='GET' && r.authorization==='Bearer token-account-B'),'Returning B must fetch only with B credentials');
    check(!document.body.textContent.includes('SUPERSEDED FIGURES'),'Superseded figures must remain absent during delayed B GETs');
    for (const resource of ['current:2025','list:2025::','detail:old-run']) check(!cache.get(financeRunsCacheKey('account-B',resource))?.data,'B run cache must not contain publisher response');
  }
  check(cache.get('unrelated-cache').data==='UNCHANGED','Unrelated cache must survive');
  check(requests.filter(r=>r.method==='POST').length===1,'Mutation must occur exactly once');
  check(announcement.includes('Current run: verified-current.'),'Announcement must name the verified current response');
 } finally { root.unmount(); }
})();
`, resolveDir: process.cwd(), loader: "tsx" }, bundle: true, write: false, platform: "browser", jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_API_URL": '""' },
    plugins: [{ name: "test-host-auth", setup(plugin: { onResolve: (options: unknown, callback: (args: { path: string }) => unknown) => void; onLoad: (options: unknown, callback: () => unknown) => void }) {
      plugin.onResolve({ filter: /^(@clerk\/nextjs|@\/components\/providers\/UserProvider)$/ }, (args) => ({ path: args.path, namespace: "test-auth" }));
      plugin.onLoad({ filter: /.*/, namespace: "test-auth" }, () => ({ contents: `export const useAuth=()=>{const userId=window.account; return {userId,isLoaded:true,getToken:async()=> 'token-'+userId};}; export const useUser=()=>null;` }));
    } }],
  });
  const dom = new JSDOM('<div id="root"></div>', { runScripts: "outside-only", pretendToBeVisual: true, url: "https://test.invalid" });
  dom.window.Response = Response;
  try { dom.window.eval(outputFiles[0].text); await dom.window.result; }
  finally { dom.window.close(); }
}
for (const action of ["approve", "demote"] as const) {
  test(`${action} clears inactive account snapshots before delayed reader remount`, () => publicationInteraction(action));
  test(`${action} clears shared approved state on B → A → B without cross-account requests`, () => publicationInteraction(action, "", true));
  for (const resource of ["current", "list", "detail"]) {
    test(`${action}: failed post-mutation ${resource} GET reports pending and retries reads only`, () => publicationInteraction(action, resource));
  }
}

import {budgetDomTest,domPrelude} from "./budgetDomTest";
test("selectsBudgetKindAndLedgerDependency",()=>budgetDomTest(domPrelude+`
import {FinanceUpload} from './src/components/finance/FinanceUpload';
import {runFixture} from './src/components/finance/financeRunTestFixture';
const ledger=runFixture({id:'ledger-one',status:'approved'});
let posted;
window.fetch=async(url,init)=>{
 const u=new URL(url,'https://test.invalid');
 if(init?.method==='POST'){posted={u,init};return json(runFixture({id:'budget-one',kind:'budgets',payload:null,dependency_run:'ledger-two'}),201);}
 if(u.pathname.includes('/current/'))return json({runs:{},compatible:true});
 if(u.pathname.includes('/runs/?')||u.pathname==='/finance/runs/')return json({results:u.searchParams.get('status')==='approved' ? [{...ledger,id:u.searchParams.get('cursor') ? 'ledger-two':'ledger-one'}] : [],next:u.searchParams.get('status')==='approved'&&!u.searchParams.has('cursor') ? '/finance/runs/?cursor=second':null,previous:null});
 return json(runFixture({id:'budget-one',kind:'budgets',payload:null,dependency_run:'ledger-two'}));
};
window.result=(async()=>{try{
root.render(<SWRConfig value={config}><FinanceUpload/></SWRConfig>);
await until(()=>select('Run kind'),'kind selector');change(select('Run kind'),'budgets');
await until(()=>select('Ledger dependency')?.textContent.includes('ledger-two'),'all ledger pages');
change(select('Ledger dependency'),'ledger-two');
const input=document.querySelector('input[type=file]');Object.defineProperty(input,'files',{value:[new File(['synthetic'],'budget.xlsx')]});input.dispatchEvent(new Event('change',{bubbles:true}));
await until(()=>!button('Upload workbook for '+new Date().getFullYear()).disabled,'upload enabled');button('Upload workbook for '+new Date().getFullYear()).click();
await until(()=>posted,'posted');check(posted.u.searchParams.get('kind')==='budgets','budget kind');check(posted.u.searchParams.get('ledger_run_id')==='ledger-two','selected exact dependency');check(posted.init.body.name==='budget.xlsx','raw body');
}finally{root.unmount();}})();
`));
test("replaysAndReapprovesBudgetCandidate",()=>budgetDomTest(domPrelude+`
import {FinanceUpload} from './src/components/finance/FinanceUpload';
import {runFixture} from './src/components/finance/financeRunTestFixture';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
let run=runFixture({kind:'budgets',id:'budget-replay',schema_version:'1.0.0',status:'superseded',dependency_run:'ledger-one',manifest:golden.manifest,payload:golden.derived});
const ledger=runFixture({id:'ledger-one',status:'approved'});const mutations=[];
window.fetch=async(url,init)=>{const u=new URL(url,'https://test.invalid');
 if(init?.method==='POST'){
  if(u.pathname==='/finance/runs/')return json(run,200);
  const options=JSON.parse(init.body);mutations.push({path:u.pathname,options});
  if(!options.acknowledge_findings)return json({code:'FINDINGS_ACKNOWLEDGEMENT_REQUIRED',detail:'Review findings'},409);
  if(!options.override_anti_rollback)return json({code:'ANTI_ROLLBACK',detail:'Confirm rollback'},409);
  run={...run,status:'approved',allowed_actions:['demote'],previous_approved:'predecessor'};return json(run);
 }
 if(u.pathname.includes('/current/'))return json({runs:run.status==='approved'?{budgets:run}:{},compatible:true});
 if(u.pathname==='/finance/runs/')return json({results:u.searchParams.get('kind')==='funders'?[ledger]:[run],next:null,previous:null});
 return json(run);
};
window.result=(async()=>{try{
root.render(<SWRConfig value={config}><FinanceUpload/></SWRConfig>);await until(()=>select('Run kind'),'kind');change(select('Run kind'),'budgets');await until(()=>select('Ledger dependency')?.textContent.includes('ledger-one'),'ledger');change(select('Ledger dependency'),'ledger-one');
const file=document.querySelector('input[type=file]');Object.defineProperty(file,'files',{value:[new File(['synthetic'],'budget.xlsx')]});file.dispatchEvent(new Event('change',{bubbles:true}));await until(()=>!button('Upload workbook for '+new Date().getFullYear()).disabled,'upload');button('Upload workbook for '+new Date().getFullYear()).click();
await until(()=>document.body.textContent.includes('Idempotent replay'),'replay');await until(()=>button('Re-approve')&&!button('Re-approve').disabled,'reapprove');
check(document.body.textContent.includes('2026 Budget!F9'),'budget finding source cells');
button('Re-approve').click();await until(()=>button('Confirm approval'),'confirmation');button('Confirm approval').click();await until(()=>document.querySelector('input[type=checkbox]'),'acknowledgement');document.querySelector('input[type=checkbox]').click();
const note=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(note,'Reviewed exact pinned source');note.dispatchEvent(new Event('input',{bubbles:true}));await until(()=>!button('Confirm approval').disabled,'note accepted');button('Confirm approval').click();await until(()=>document.querySelectorAll('input[type=checkbox]').length===2,'rollback');document.querySelectorAll('input[type=checkbox]')[1].click();await until(()=>!button('Confirm approval').disabled,'rollback checked');button('Confirm approval').click();
await until(()=>document.body.textContent.includes('Approved server state refreshed. Current run: budget-replay.'),'budget refreshed');check(mutations.length===3,'two guards then success');check(mutations[2].options.note==='Reviewed exact pinned source','note retained');check(mutations.every(m=>m.path==='/finance/runs/budget-replay/approve/'),'same retained run');check(!document.body.textContent.includes('Imported snapshot'),'budget schema 1 is not factless snapshot');
}finally{root.unmount();}})();
`));
test("keepsReadOnlyAndUnprivilegedUsersOut",()=>budgetDomTest(domPrelude+`
import {FinanceUpload} from './src/components/finance/FinanceUpload';
import FinanceFixPage from './src/app/operations/finance/fix/page';
let calls=0;window.fetch=()=>{calls++;return new Promise(()=>{});};
window.result=(async()=>{try{
for(const capabilities of [[],['finance.read'],['finance.publish']]) {
 window.capabilities=capabilities;root.render(<SWRConfig value={config}><FinanceUpload/></SWRConfig>);await until(()=>document.body.textContent.includes('Finance read and publish access are required'),'publisher denied');check(!document.querySelector('input[type=file]'),'no upload controls');check(calls===0,'no candidate reads');
}
window.capabilities=[];root.render(<SWRConfig value={config}><FinanceFixPage/></SWRConfig>);await until(()=>document.body.textContent.includes('Finance read access is required'),'direct Fix denied');check(calls===0,'no denied Fix reads');
}finally{root.unmount();}})();
`));
for (const dimension of ["kind","year","actor"] as const) test(`pending budget upload cannot restore candidate after switching ${dimension}`,()=>budgetDomTest(domPrelude+`
import {FinanceUpload} from './src/components/finance/FinanceUpload';import {runFixture} from './src/components/finance/financeRunTestFixture';
const dimension=${JSON.stringify(dimension)};const ledger=runFixture({id:'ledger-one',status:'approved'});let resolveUpload;const calls=[];
window.fetch=async(url,init)=>{calls.push({url,init});if(init?.method==='POST')return new Promise(resolve=>{resolveUpload=()=>resolve(new Response(JSON.stringify(runFixture({id:'late-budget',kind:'budgets',payload:null})),{status:201}));});if(String(url).includes('/current/'))return json({runs:{},compatible:true});return json({results:[ledger],next:null,previous:null});};
const render=()=>root.render(<SWRConfig value={config}><FinanceUpload/></SWRConfig>);
window.result=(async()=>{try{
render();await until(()=>select('Run kind'),'kind');change(select('Run kind'),'budgets');await until(()=>select('Ledger dependency')?.textContent.includes('ledger-one'),'ledger');change(select('Ledger dependency'),'ledger-one');const file=document.querySelector('input[type=file]');Object.defineProperty(file,'files',{value:[new File(['synthetic'],'budget.xlsx')]});file.dispatchEvent(new Event('change',{bubbles:true}));await until(()=>!button('Upload workbook for '+new Date().getFullYear()).disabled,'upload');button('Upload workbook for '+new Date().getFullYear()).click();await until(()=>resolveUpload,'pending upload');
if(dimension==='kind')change(select('Run kind'),'funders');else if(dimension==='actor'){window.actor='actor-B';render();}else{const year=document.querySelector('input[type=number]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(year,'2025');year.dispatchEvent(new Event('input',{bubbles:true}));}
await until(()=>!document.querySelector('progress'),'new context');resolveUpload();await pause();await pause();check(!document.body.textContent.includes('late-budget'),'late candidate cannot return');check(document.querySelector('select[aria-label=Run]').value==='','candidate cleared');check(button('Upload workbook for '+(dimension==='year'?'2025':new Date().getFullYear())).disabled,'file and dependency reset');check(calls.filter(c=>c.init?.method==='POST').length===1,'one authorized upload');
}finally{root.unmount();}})();
`));
test("approval completed after actor switch invalidates shared current without publishing old actor reads",()=>budgetDomTest(domPrelude+`
import {FinanceUpload} from './src/components/finance/FinanceUpload';import {runFixture} from './src/components/finance/financeRunTestFixture';import useSWR from 'swr';import {useAuth} from '@clerk/nextjs';import {financeRunsCacheKey,getFinanceCurrent} from './src/lib/api/finance-runs';
const year=new Date().getFullYear();const cache=new Map();const options={...config,provider:()=>cache};cache.set(financeRunsCacheKey('actor-B','current:'+year),{data:{runs:{budgets:{id:'old-current'}}}});
const candidate=runFixture({id:'budget-candidate',kind:'budgets',payload:null});let resolveApproval;let changed=false;const calls=[];
window.fetch=async(url,init)=>{calls.push({url,init});if(init?.method==='POST')return new Promise(resolve=>{resolveApproval=()=>{changed=true;resolve(new Response(JSON.stringify({...candidate,status:'approved'})));};});if(window.actor==='actor-B')return changed ? json({runs:{budgets:{id:'new-current'}}}) : new Promise(()=>{});if(String(url).includes('/current/'))return json({runs:{},compatible:true});if(String(url).includes('/runs/?'))return json({results:[candidate],next:null,previous:null});return json(candidate);};
function Reader(){const{userId,getToken}=useAuth();const{data}=useSWR(financeRunsCacheKey(userId,'current:'+year),async()=>getFinanceCurrent(await getToken(),year));return <p>{data?.runs.budgets.id??'Loading'}</p>;}
window.result=(async()=>{try{
root.render(<SWRConfig value={options}><FinanceUpload/></SWRConfig>);await until(()=>select('Run kind'),'kind');change(select('Run kind'),'budgets');await until(()=>document.querySelector('select[aria-label=Run]')?.textContent.includes('budget-candidate'),'candidate');change(document.querySelector('select[aria-label=Run]'),'budget-candidate');await until(()=>button('Approve')&&!button('Approve').disabled,'approve');button('Approve').click();await until(()=>button('Confirm approval'),'dialog');button('Confirm approval').click();await until(()=>resolveApproval,'pending approval');window.actor='actor-B';root.render(<SWRConfig value={options}><Reader/></SWRConfig>);await until(()=>document.body.textContent.includes('old-current'),'reader seeded');await until(()=>calls.some(c=>c.init?.headers.Authorization==='Bearer token-actor-B'),'pending B read');resolveApproval();await until(()=>document.body.textContent.includes('new-current'),'new actor refreshed');check(calls.filter(c=>c.init?.method==='POST').length===1,'one mutation');const reads=calls.filter(c=>c.init?.headers.Authorization==='Bearer token-actor-B');check(reads.length>=2,'new actor own reads');
}finally{root.unmount();}})();
`));
