import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import golden from "@/lib/finance/fixtures/budget-run-1.0.0.json";
import type { BudgetPayload } from "@/lib/types/finance-budgets";
import { FinanceBudgetOverview } from "./FinanceBudgetOverview";
import { budgetDomTest, domPrelude } from "./budgetDomTest";

const payload = golden.derived as BudgetPayload;

test("overview shows authoritative department values and incomplete subtotals without an invented organisation total", () => {
  const html = renderToStaticMarkup(
    <FinanceBudgetOverview
      payload={payload}
      manifest={golden.manifest}
      runId="approved-budget"
    />,
  );
  for (const label of [
    "Where spending is heading",
    "Department A",
    "Unavailable",
    "Known subtotal: ",
    "-R 1,98",
    "Some budget figures are incomplete",
  ])
    assert.ok(html.includes(label), label);
  assert.doesNotMatch(html, /Total projected|Annual budget total|R25k|555k/);
  assert.doesNotMatch(html, /View expenses for/);
  assert.ok(html.includes(golden.manifest.dependencies[0].run_id));
});

test("overview preserves producer variance rather than subtracting independently rounded projected and budget", () => {
  const hierarchy = [-1, 0, 1].map((sign, index) => ({
    ...payload.hierarchy[0],
    id: `department-${index}`,
    label: `Department ${index}`,
    complete: true,
    projected: "0.02",
    budget: "1.00",
    variance_all: sign === -1 ? "-0.99" : sign === 0 ? "0.00" : "0.99",
  }));
  const html = renderToStaticMarkup(
    <FinanceBudgetOverview
      payload={{ ...payload, hierarchy }}
      manifest={golden.manifest}
      runId="approved-budget"
    />,
  );
  for (const label of [
    "-R 0,99",
    "R 0,00",
    "R 0,99",
    "Below budget",
    "On budget",
    "Above budget",
  ])
    assert.ok(html.includes(label), label);
  assert.doesNotMatch(html, /-R 0,98/);
});

test("overview drills department to a line and its authenticated pinned ledger expenses", () =>
  budgetDomTest(
    domPrelude +
      `
import {FinanceBudgetOverview} from './src/components/finance/FinanceBudgetOverview';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
const calls=[];
window.fetch=async(url,init)=>{calls.push({url,init});return json({results:[{row_key:'source-row',sheet_row:18,date:'2026-01-01',year:2026,description:'Source expense evidence',amount:'0.01',bc:'101'}],next:null,previous:null,run_id:'approved-budget',ledger_run_id:'pinned-ledger',management_accounts_sha256:'abc',contributor_basis:'full_ledger_amount_before_budget_share'});};
window.result=(async()=>{try{
root.render(<SWRConfig value={config}><FinanceBudgetOverview payload={golden.derived} manifest={golden.manifest} runId="approved-budget"/></SWRConfig>);
await until(()=>document.querySelector('button[aria-label^="Explore Department A"]'),'department');
check(!document.body.textContent.includes('View expenses for Line 6'),'lines collapsed');document.querySelector('button[aria-label^="Explore Department A"]').focus();document.querySelector('button[aria-label^="Explore Department A"]').click();
await until(()=>button('View expenses for Line 6'),'line drilldown');check(document.body.textContent.includes('-R 0,99'),'exact producer variance');button('View expenses for Line 6').click();
await until(()=>document.body.textContent.includes('Source expense evidence'),'source expense');
check(calls.length===1,'one bounded contributor request');check(calls[0].url.includes('/finance/runs/approved-budget/rows/'),'approved run pinned');check(calls[0].init.headers.Authorization==='Bearer token-actor-A','bearer auth');
const url=new URL(calls[0].url,'https://test.invalid');check(url.searchParams.get('bc')==='101','exact selected BC');check(url.searchParams.get('year')==='2026','accounting year');
check(document.querySelector('[role=dialog]'),'expense dialog');check(document.querySelector('[role=dialog]').contains(document.activeElement),'focus enters expense dialog');document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await until(()=>!document.querySelector('[role=dialog]'),'Escape closes expenses');await until(()=>document.activeElement===button('View expenses for Line 6'),'focus returns to line');
document.querySelector('button[aria-expanded]').click();await until(()=>!document.body.textContent.includes('Source expense evidence'),'closing department clears source selection');check(document.activeElement===document.querySelector('button[aria-label^="Explore Department A"]'),'closing department returns comparison focus');
}finally{root.unmount();}})();
`,
  ));

test("overview reader preserves no-approved, error, compatibility and account-switch boundaries", () =>
  budgetDomTest(
    domPrelude +
      `
import {FinanceBudgets} from './src/components/finance/FinanceBudgetsPage';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
import {runFixture} from './src/components/finance/financeRunTestFixture';
let mode='none';const calls=[];
window.fetch=async(url,init)=>{calls.push({url,init});if(mode==='error')return json({detail:'Failure'},500);if(String(url).includes('/current/'))return json({accounting_year:2026,runs:mode==='none'?{}:{budgets:{id:'approved-budget'}},compatible:false,compatibility_reason:{code:'SOURCE_MISMATCH',runs:{}}});return json(runFixture({kind:'budgets',id:'approved-budget',status:'approved',accounting_year:2026,manifest:golden.manifest,payload:golden.derived}));};
const render=(year=2026)=>root.render(<SWRConfig value={config}><FinanceBudgets presentation="overview" year={year}/></SWRConfig>);
window.result=(async()=>{try{
window.capabilities=[];render();await until(()=>document.body.textContent.includes('Finance read access is required'),'denied');check(calls.length===0,'no denied fetch');
window.capabilities=['finance.read'];render();await until(()=>document.body.textContent.includes('No approved budget run for 2026'),'no approved');
mode='error';window.actor='actor-B';render();await until(()=>button('Retry budgets'),'retryable error');check(!document.body.textContent.includes('Department A'),'no stale budget');
mode='approved';button('Retry budgets').click();await until(()=>document.body.textContent.includes('Department A'),'approved overview');check(document.body.textContent.includes('Current runs are incompatible'),'compatibility visible');
window.actor='actor-C';window.fetch=()=>new Promise(()=>{});render();await until(()=>document.body.textContent.includes('Loading approved budgets'),'new account loading');check(!document.body.textContent.includes('Department A'),'prior account removed');
render(2025);await pause();check(!document.body.textContent.includes('Department A'),'prior year removed');
}finally{root.unmount();}})();
`,
  ));
