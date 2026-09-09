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

import { BudgetOrganisationOutlook } from "./BudgetOrganisationOutlook";
import { BudgetSpendingComposition } from "./BudgetSpendingComposition";
import { budgetInsightsFixture } from "./budgetInsightsTestFixture";

test("organisation outlook consumes exact server totals and pre-rounding variance without deriving a replacement", () => {
  const html = renderToStaticMarkup(
    <BudgetOrganisationOutlook insights={budgetInsightsFixture()} />,
  );
  for (const label of [
    "Projected year-end expenditure",
    "R 14,63",
    "R 14,65",
    "R 9,75",
    "-R 0,03",
    "Projected below budget",
  ])
    assert.ok(html.includes(label), label);
  assert.doesNotMatch(html, /-R 0,02/);
  const insights = budgetInsightsFixture();
  insights.organisation.projected = {
    ...insights.organisation.projected,
    total: null,
    complete: false,
    known_subtotal: "7.00",
  };
  insights.organisation.actual.total = "0.00";
  const incomplete = renderToStaticMarkup(
    <BudgetOrganisationOutlook insights={insights} />,
  );
  assert.match(incomplete, /Unavailable/);
  assert.match(incomplete, /Known subtotal: R 7,00/);
  assert.match(incomplete, /R 0,00/);
  assert.doesNotMatch(incomplete, /R 14,63/);
});

test("spending composition retains annual ledger denominator and unbudgeted bucket with accessible exact values", () => {
  const insights = budgetInsightsFixture();
  const html = renderToStaticMarkup(
    <BudgetSpendingComposition
      composition={insights.composition}
      departments={payload.hierarchy}
      onSelect={() => {}}
    />,
  );
  for (const label of [
    "spending-composition-chart",
    "R 9,77",
    "R 9,75",
    "R 0,02",
    "99.8%",
    "0.2%",
    "Unbudgeted / unmapped expenditure",
    "<caption",
    "not a measure of flexible funding",
  ])
    assert.ok(html.includes(label), label);
  assert.match(html, /<button[^>]*>Department A<\/button>/);
  assert.doesNotMatch(html, /<button[^>]*>Unbudgeted/);
});

test("spending composition with incomplete, negative or zero data displays amounts but never a misleading donut", () => {
  for (const [reason, total, amount] of [
    ["incomplete_actuals", "10.00", null],
    ["negative_amounts", "10.00", "-2.00"],
    ["zero_total", "0.00", "0.00"],
  ] as const) {
    const composition = {
      ...budgetInsightsFixture().composition,
      total,
      available: false,
      reasons: [reason],
      buckets: [
        { id: "2026-4", label: "Department A", amount, percentage: null },
      ],
    };
    const html = renderToStaticMarkup(
      <BudgetSpendingComposition
        composition={composition}
        departments={payload.hierarchy}
        onSelect={() => {}}
      />,
    );
    assert.doesNotMatch(html, /<svg|spending-composition-chart/);
    assert.match(html, /Spending chart unavailable/);
    assert.match(html, /Department A/);
    assert.ok(
      html.includes(
        amount === null
          ? "Unavailable"
          : amount === "-2.00"
            ? "-R 2,00"
            : "R 0,00",
      ),
    );
  }
});

test("rounded percentages and monetary residual are displayed as server evidence without correcting shares", () => {
  const composition = {
    ...budgetInsightsFixture().composition,
    total: "1.00",
    residual: "0.01",
    buckets: [0, 1, 2].map((index) => ({
      id: String(index),
      label: `Bucket ${index}`,
      amount: "0.33",
      percentage: "33.3",
    })),
  };
  const html = renderToStaticMarkup(
    <BudgetSpendingComposition
      composition={composition}
      departments={[]}
      onSelect={() => {}}
    />,
  );
  assert.match(html, /spending-composition-chart/);
  assert.equal((html.match(/33.3%/g) ?? []).length, 3);
  assert.match(html, /rounding difference of R 0,01/);
  assert.doesNotMatch(html, /33.4%/);
});

test("missing or differently bound insight enrichment leaves department overview available without cross-run totals", () => {
  const valid = budgetInsightsFixture();
  for (const insights of [
    undefined,
    { ...valid, run_id: "other-run" },
    { ...valid, ledger_run_id: "other-ledger" },
    { ...valid, accounting_year: 2025 },
    { ...valid, sheet_as_of: "2026-01-01" },
  ]) {
    const html = renderToStaticMarkup(
      <FinanceBudgetOverview
        payload={payload}
        manifest={golden.manifest}
        runId="approved-budget"
        insights={insights}
      />,
    );
    assert.match(html, /Organisation totals are unavailable/);
    assert.match(html, /Department A/);
    assert.doesNotMatch(html, /R 14,63|spending-composition-chart/);
  }
});

test("approved reader wires optional insight response and composition links to the same department expenses", () =>
  budgetDomTest(
    domPrelude +
      `
import {FinanceBudgets} from './src/components/finance/FinanceBudgetsPage';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
import {runFixture} from './src/components/finance/financeRunTestFixture';
import {budgetInsightsFixture} from './src/components/finance/budgetInsightsTestFixture';
const wire=runFixture({kind:'budgets',id:'approved-budget',status:'approved',accounting_year:2026,manifest:golden.manifest,payload:golden.derived,budget_insights:budgetInsightsFixture()});
window.fetch=async(url)=>String(url).includes('/current/')?json({accounting_year:2026,runs:{budgets:{id:wire.id}},compatible:true}):json(wire);
window.result=(async()=>{try{
root.render(<SWRConfig value={config}><FinanceBudgets presentation="overview" year={2026}/></SWRConfig>);
await until(()=>document.body.textContent.includes('R 14,63'),'server organisation total');check(document.body.textContent.includes('-R 0,03'),'exact server variance');
const composition=document.querySelector('section[aria-labelledby="spending-composition-title"]');const link=composition.querySelector('button');link.focus();link.click();
await until(()=>button('View expenses for Line 6'),'composition department drilldown');check(document.activeElement.textContent==='Department A: budget lines','department detail focus');link.focus();link.click();await until(()=>document.activeElement.textContent==='Department A: budget lines','same department link restores detail focus');
window.actor='actor-B';window.fetch=()=>new Promise(()=>{});root.render(<SWRConfig value={config}><FinanceBudgets presentation="overview" year={2026}/></SWRConfig>);
await until(()=>document.body.textContent.includes('Loading approved budgets'),'replacement account');check(!document.body.textContent.includes('R 14,63'),'old totals removed');check(!document.querySelector('[data-testid="spending-composition-chart"]'),'old composition removed');
}finally{root.unmount();}})();
`,
  ));

test("half-cent composition uses exact-source percentages for two equal arcs despite rounded money residual", () => {
  const composition = {
    ...budgetInsightsFixture().composition,
    total: "0.01",
    residual: "-0.01",
    buckets: [0, 1].map((index) => ({
      id: String(index),
      label: `Half ${index}`,
      amount: "0.01",
      percentage: "50.000000",
    })),
  };
  const html = renderToStaticMarkup(
    <BudgetSpendingComposition
      composition={composition}
      departments={[]}
      onSelect={() => {}}
    />,
  );
  assert.equal((html.match(/stroke-dasharray="50 50"/g) ?? []).length, 2);
  assert.equal((html.match(/50.0%/g) ?? []).length, 2);
  assert.match(html, /rounding difference of -R 0,01/);
});

test("budget-line outlook distinguishes annual ledger spending and shows unmapped scope even for a net zero bucket", () => {
  const insights = budgetInsightsFixture();
  insights.composition.buckets[1].amount = "0.00";
  const html = renderToStaticMarkup(
    <FinanceBudgetOverview
      payload={{ ...payload, summary: { ...payload.summary, orphan_count: 2 } }}
      manifest={golden.manifest}
      runId="approved-budget"
      insights={insights}
    />,
  );
  assert.match(html, /Actual against budget lines/);
  assert.match(html, /not part of this projection/);
  assert.match(html, /R 9,75/);
  assert.match(html, /R 9,77/);
});
