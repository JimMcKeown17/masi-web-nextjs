import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import golden from "@/lib/finance/fixtures/budget-run-1.0.0.json";
import type { BudgetPayload } from "@/lib/types/finance-budgets";
import { FinanceBudgetsView } from "./FinanceBudgets";
const payload = golden.derived as BudgetPayload;
test("rendersHierarchyAndProducerValues", () => {
  const html = renderToStaticMarkup(<FinanceBudgetsView payload={payload} manifest={golden.manifest} runId="budget-one" />);
  for (const text of ["Department A","Sub-department", "Line 6","-R 0,99","linear projection","budget used","2026-07-15","7"]) assert.ok(html.includes(text),text);
  assert.match(html,/aria-expanded="true"/);
});
test("distinguishesNullZeroAndWfExclusion", () => {
  const html=renderToStaticMarkup(<FinanceBudgetsView payload={payload} manifest={golden.manifest} runId="budget-one"/>);
  for(const text of ["budget not set","actual unavailable","excluded by WF","R 0,00","Known subtotal"]) assert.ok(html.includes(text),text);
});
test("showsPinnedLedgerAndIncompatibleCurrent", () => {
  const html=renderToStaticMarkup(<FinanceBudgetsView payload={payload} manifest={golden.manifest} runId="budget-one" compatibility={{accounting_year:2026,runs:{},compatible:false,compatibility_reason:{code:"SOURCE_MISMATCH",runs:{}}}}/>);
  for(const text of ["Pinned ledger",golden.manifest.dependencies[0].run_id!,golden.manifest.dependencies[0].source_sha256!,"Current runs are incompatible","different Management Accounts sources"]) assert.ok(html.includes(text),text);
});

import { BudgetFindings } from "./BudgetFindings";
test("preservesAllFindingSeverities", () => {
  const findings=(["error","warn","info"] as const).flatMap(severity=>[true,false].map(in_scope_year=>({...payload.findings[0],severity,in_scope_year,message:`visible-${severity}-${in_scope_year}`})));
  const html=renderToStaticMarkup(<BudgetFindings findings={findings}/>);
  for(const finding of findings) assert.ok(html.includes(finding.message));
  assert.match(html,/Export CSV/);assert.match(html,/Export XLSX/);assert.match(html,/Severity/);
});
import {budgetDomTest,domPrelude} from "./budgetDomTest";
test("exportsVisibleRowsAndLabelsSharedContributors",()=>budgetDomTest(domPrelude+`
import {FinanceBudgetsView} from './src/components/finance/FinanceBudgets';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
let exported;URL.createObjectURL=blob=>{exported=blob;return 'blob:synthetic';};URL.revokeObjectURL=()=>{};HTMLAnchorElement.prototype.click=()=>{};
window.result=(async()=>{try{
root.render(<FinanceBudgetsView payload={golden.derived} manifest={golden.manifest} runId="budget-one"/>);
await until(()=>button('Export CSV'),'budget exports');
check(document.body.textContent.includes('Shared BC'),'shared label');check(document.body.textContent.includes('Full ledger amounts before budget share'),'full amount label');
const filter=document.querySelector('input[aria-label="Filter budget rows"]');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(filter,'Line 6');filter.dispatchEvent(new Event('input',{bubbles:true}));
await until(()=>!document.body.textContent.includes('Line 7'),'filtered table');button('Export CSV').click();await until(()=>exported,'download');const text=await exported.text();check(text.includes('Line 6')&&!text.includes('Line 7'),'export visible filter');check(text.includes('-R 0,99'),'producer display value');
}finally{root.unmount();}})();
`));
test("contributors paginate pinned ledger and export full amounts with bearer auth",()=>budgetDomTest(domPrelude+`
import {FinanceBudgetsView} from './src/components/finance/FinanceBudgets';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
let exported;const calls=[];URL.createObjectURL=blob=>{exported=blob;return 'blob:synthetic';};URL.revokeObjectURL=()=>{};HTMLAnchorElement.prototype.click=()=>{};
window.fetch=async(url,init)=>{const u=new URL(url,'https://test.invalid');calls.push({u,init});if(u.pathname.includes('export'))return new Response('server-export');return json({results:[{row_key:'one',description:u.searchParams.has('cursor')?'second contributor':'first contributor',date:'2026-01-01',amount:'0.01',bc:u.searchParams.get('bc')}],next:u.searchParams.has('cursor')?null:'/rows/?cursor=next%2B',previous:null,run_id:'budget-one',ledger_run_id:'pinned-one',management_accounts_sha256:'abc',contributor_basis:'full_ledger_amount_before_budget_share'});};
window.result=(async()=>{try{
root.render(<SWRConfig value={config}><FinanceBudgetsView payload={golden.derived} manifest={golden.manifest} runId="budget-one"/></SWRConfig>);
await until(()=>button('View contributors for Line 6'),'contributor button');button('View contributors for Line 6').click();
await until(()=>document.body.textContent.includes('first contributor'),'first page');check(document.body.textContent.includes('pinned-one'),'pinned response id');button('Next contributors').click();await until(()=>document.body.textContent.includes('second contributor'),'next page');
button('Download contributors CSV').click();await until(()=>exported,'server export');check(await exported.text()==='server-export','download bytes');check(calls.every(c=>c.u.pathname.startsWith('/finance/runs/budget-one/rows/')&&c.init.headers.Authorization==='Bearer token-actor-A'),'pinned path auth');check(calls[1].u.searchParams.get('cursor')==='next+','cursor');check(calls.at(-1).u.searchParams.get('bc')==='101','exact BC');
}finally{root.unmount();}})();
`));
test("budget reader denies direct access and clears late responses across actor and year",()=>budgetDomTest(domPrelude+`
import {FinanceBudgets} from './src/components/finance/FinanceBudgetsPage';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
import {runFixture} from './src/components/finance/financeRunTestFixture';
let resolveOld;const calls=[];
window.fetch=async(url,init)=>{calls.push({url,init});if(String(url).includes('/current/'))return json({accounting_year:2026,runs:{budgets:{id:'old-budget'}},compatible:true});return new Promise(resolve=>{resolveOld=()=>resolve(new Response(JSON.stringify(runFixture({kind:'budgets',id:'old-budget',status:'approved',manifest:golden.manifest,payload:golden.derived}))));});};
const render=()=>root.render(<SWRConfig value={config}><FinanceBudgets/></SWRConfig>);
window.result=(async()=>{try{
window.capabilities=[];render();await until(()=>document.body.textContent.includes('Finance read access is required'),'denied route');check(calls.length===0,'no denied requests');
window.capabilities=['finance.read'];render();await until(()=>resolveOld,'pending old detail');window.actor='actor-B';window.fetch=()=>new Promise(()=>{});render();await pause();resolveOld();await pause();check(!document.body.textContent.includes('Department A'),'old actor figures absent');
const year=document.querySelector('input[type=number]');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(year,'2025');year.dispatchEvent(new Event('input',{bubbles:true}));await pause();check(!document.body.textContent.includes('Department A'),'old year figures absent');
}finally{root.unmount();}})();
`));
test("Fix severity and year-scope filters export exactly the displayed budget findings",()=>budgetDomTest(domPrelude+`
import {BudgetFindings} from './src/components/finance/BudgetFindings';import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
let exported;URL.createObjectURL=blob=>{exported=blob;return 'blob:synthetic';};URL.revokeObjectURL=()=>{};HTMLAnchorElement.prototype.click=()=>{};
const findings=['error','warn','info'].flatMap(severity=>[true,false].map(in_scope_year=>({...golden.derived.findings[0],severity,in_scope_year,message:'finding-'+severity+'-'+in_scope_year})));
window.result=(async()=>{try{root.render(<BudgetFindings findings={findings}/>);await until(()=>select('Severity'),'filters');change(select('Severity'),'info');change(select('Finding year scope'),'out');await until(()=>document.querySelectorAll('tbody tr').length===1,'one visible finding');button('Export CSV').click();await until(()=>exported,'download');const text=await exported.text();check(text.includes('finding-info-false'),'selected finding exported');for(const f of findings.filter(f=>f.message!=='finding-info-false'))check(!text.includes(f.message),'hidden finding excluded');check(document.querySelector('tbody').textContent.includes('finding-info-false'),'same displayed row');}finally{root.unmount();}})();
`));

import {getFinanceRun} from "@/lib/api/finance-runs";
import {FinanceRunSummary} from "./FinanceRunSummary";
import {runFixture} from "./financeRunTestFixture";
test("approved backend wire payload is derived directly, with manifest separate",async()=>{
 const previous=global.fetch;
 // finance_runs.py stores artifact['derived']; run_detail returns it unchanged.
 const wire={...runFixture(),id:'wire-budget',kind:'budgets',schema_version:'1.0.0',status:'approved',manifest:golden.manifest,payload:golden.derived,dependency_run:golden.manifest.dependencies[0].run_id};
 global.fetch=async()=>new Response(JSON.stringify(wire));
 try {
  const run=await getFinanceRun('synthetic-token','wire-budget');
  assert.ok(run.payload&&!('derived' in run.payload));
  assert.deepEqual(run.manifest,golden.manifest);
  const html=renderToStaticMarkup(<FinanceRunSummary run={run} onAction={()=>{}}/>);
  for(const label of ['Department A','Line 6','-R 0,99','MISSING_BUDGET',golden.manifest.dependencies[0].run_id])assert.ok(html.includes(label),label);
 }finally{global.fetch=previous;}
});
test("current budget reader and Fix consume exact derived-only API responses",()=>budgetDomTest(domPrelude+`
import {FinanceBudgets} from './src/components/finance/FinanceBudgetsPage';import Fix from './src/app/operations/finance/fix/page';import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';import {runFixture} from './src/components/finance/financeRunTestFixture';
const wire={...runFixture(),id:'wire-budget',kind:'budgets',schema_version:'1.0.0',status:'approved',accounting_year:2026,manifest:golden.manifest,payload:golden.derived,dependency_run:golden.manifest.dependencies[0].run_id};
window.fetch=async(url)=>String(url).includes('/current/')?json({accounting_year:2026,runs:{budgets:{id:wire.id}},compatible:true}):json(wire);
window.result=(async()=>{try{root.render(<SWRConfig value={config}><FinanceBudgets year={2026}/></SWRConfig>);await until(()=>document.body.textContent.includes('Department A'),'derived-only reader');check(document.body.textContent.includes(golden.manifest.dependencies[0].run_id),'separate manifest provenance');root.render(<SWRConfig value={config}><Fix/></SWRConfig>);await until(()=>select('Finding kind'),'Fix kind');change(select('Finding kind'),'budgets');await until(()=>document.body.textContent.includes('Budget findings'),'derived-only Fix');check(document.querySelectorAll('tbody tr').length===golden.derived.findings.length,'every wire finding');}finally{root.unmount();}})();
`));
test("hierarchy shows chevrons and readable completeness labels without dropping flags",()=>{
 const html=renderToStaticMarkup(<FinanceBudgetsView payload={payload} manifest={golden.manifest} runId="presentation-budget"/>);
 assert.match(html,/<svg[^>]*aria-hidden="true"/);
 for(const label of ['Budget incomplete','Actual incomplete','Projected amount incomplete','All Funds variance incomplete','Masi variance incomplete','Budget unavailable','Actual unavailable'])assert.ok(html.includes(label),label);
 assert.doesNotMatch(html,/budget_incomplete|projected_incomplete|variance_all_incomplete/);
});

test("department comparison keeps missing totals unavailable and labels Masi scope",()=>budgetDomTest(domPrelude+`
import {FinanceBudgetsView} from './src/components/finance/FinanceBudgets';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
window.result=(async()=>{try{
root.render(<FinanceBudgetsView payload={golden.derived} manifest={golden.manifest} runId="budget-one"/>);
await until(()=>document.querySelector('[aria-label="Department projected variance comparison"]'),'comparison');
const chart=document.querySelector('[aria-label="Department projected variance comparison"]');
const department=golden.derived.hierarchy.find(row=>row.parent_id===null);
check(department.variance_all===null,'incomplete fixture total');
check(chart.textContent.includes('Unavailable')&&chart.textContent.includes('Known subtotal'),'missing total not plotted as zero');
change(document.querySelector('[aria-label="Variance basis"]'),'variance_masi');
await until(()=>document.body.textContent.includes('It is not a measure of flexible funding'),'Masi distinction');
chart.querySelector('button').click();await until(()=>button('All departments'),'department selected');
check(document.activeElement.id==='budget-detail-title','focus lands on department detail');
check(document.getElementById('budget-detail-title').textContent===department.label,'selected department title');
button('All departments').click();await until(()=>document.getElementById('budget-detail-title').textContent==='Budget detail','department reset');
}finally{root.unmount();}})();
`));

test("expense sheet preserves full amounts and restores focus when dismissed",()=>budgetDomTest(domPrelude+`
import {FinanceBudgetsView} from './src/components/finance/FinanceBudgets';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
const payload=JSON.parse(JSON.stringify(golden.derived));const line=payload.lines.find(row=>row.label==='Line 6');line.actual_share='0.5';line.actual='50.00';
window.fetch=async()=>json({results:[{row_key:'expense-unique',sheet_row:27,description:'Original ledger expense',date:'2026-01-01',amount:'100.00',bc:'101'}],next:null,previous:null,run_id:'budget-one',ledger_run_id:'pinned-one',management_accounts_sha256:'abc',contributor_basis:'full_ledger_amount_before_budget_share'});
window.result=(async()=>{try{
root.render(<SWRConfig value={config}><FinanceBudgetsView payload={payload} manifest={golden.manifest} runId="budget-one"/></SWRConfig>);
await until(()=>button('View contributors for Line 6'),'expense trigger');const trigger=button('View contributors for Line 6');trigger.focus();trigger.click();
await until(()=>document.body.textContent.includes('Original ledger expense'),'sheet expense');
const dialog=document.querySelector('[role="dialog"]');check(dialog,'accessible dialog');
check(dialog.textContent.includes('R 50,00')&&dialog.textContent.includes('R 100,00'),'applied line actual and full row amount distinct');
check(dialog.textContent.includes('Applied share: 0.5'),'explicit share');check(dialog.textContent.includes('Source row')&&dialog.textContent.includes('27'),'source row retained');
button('Close').click();await until(()=>!document.querySelector('[role="dialog"]'),'sheet closed');
// Radix dispatches its unmount autofocus event in a timer after removing the dialog.
await until(()=>document.activeElement===trigger,'focus returned to exact expense trigger');
}finally{root.unmount();}})();
`));
