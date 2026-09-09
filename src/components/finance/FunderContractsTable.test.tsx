import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { FinanceLine } from "@/lib/types/finance";

import { loadFixture } from "../../lib/finance/testFixture";
import { contractHref, FunderContractsTable } from "./FunderContractsTable";

const snapshot = loadFixture();

function render(expanded: string[] = []) {
  return renderToStaticMarkup(
    <FunderContractsTable contracts={snapshot.funder_contracts} accountingYear={2026} initiallyExpanded={expanded} />,
  );
}

test("shows contract-lifetime figures and a separately labelled in-year column", () => {
  const markup = render();
  assert.match(markup, />Allocated \(lifetime\)</);
  assert.match(markup, />Allocated \(2026 only\)</);
  assert.match(markup, /R 7 000,00/);
  assert.match(markup, /R 5 900,00/);
  assert.match(markup, /R 1 900,00/);
  assert.match(markup, /R 1 100,00/);
  assert.doesNotMatch(markup, /R 5 100,00/);
  assert.match(markup, /84\.3%/);
});

test("a null budget reads budget not set and never R0 or 100%", () => {
  const markup = render();
  const beta = markup.slice(markup.indexOf("Beta Skills 2026"));
  const betaRow = beta.slice(0, beta.indexOf("Gamma Trust"));
  // Budget, Remaining and % cells, plus the de-duplicated status badge.
  assert.equal((betaRow.match(/budget not set/g) ?? []).length, 4);
  assert.doesNotMatch(betaRow, /100\.0%/);
  assert.doesNotMatch(betaRow, />R 0,00</);
});

test("incomplete contracts carry badges naming their reasons", () => {
  const markup = render();
  assert.match(markup, /typed line/);
  assert.match(markup, /unbound R 300,00/);
  assert.match(markup, /budget not set/);
});

test("expanded contracts list their lines with binding and keys", () => {
  const markup = render(["3f2969a42c54"]);
  assert.match(markup, /Youth Jobs/);
  assert.match(markup, /Training/);
  assert.match(markup, /derived/);
  assert.match(markup, /asserted/);
  assert.match(markup, /Alpha Flag = 2026/);
  assert.match(markup, /R 250,00/);
});

test("out-of-scope contracts are marked", () => {
  const markup = render();
  const delta = markup.slice(markup.indexOf(">Delta<"));
  assert.match(delta, /no 2026 rows/);
});

test("the operator's contract code leads the row and the label follows; a missing code falls back to the label", () => {
  const markup = render();
  const alpha = markup.slice(markup.indexOf(">ALPHA-26-27<"));
  assert.match(alpha.slice(0, alpha.indexOf("</tr>")), /Alpha · April 2026 - March 2027/);
  assert.match(markup, />Delta</);
});

test("a coded contract card exposes its stable contract-code route", () => {
  const markup = render();
  const alphaHref = "/operations/finance/funders/ALPHA-26-27";
  const alphaRow = markup.slice(markup.lastIndexOf("<article", markup.indexOf(">ALPHA-26-27<")), markup.indexOf("</article>", markup.indexOf(">ALPHA-26-27<")));
  const delta = markup.slice(markup.indexOf(">Delta<"));

  assert.match(alphaRow, new RegExp(`href="${alphaHref}"`));
  assert.match(alphaRow, new RegExp(`data-contract-href="${alphaHref}"`));
  assert.doesNotMatch(delta.slice(0, delta.indexOf("</article>")), /data-contract-href/);
  assert.equal(contractHref("A/B 2026"), "/operations/finance/funders/A%2FB%202026");
});

function renderLine(overrides: Partial<FinanceLine>) {
  const contract = structuredClone(snapshot.funder_contracts[0]);
  contract.lines = [{ ...contract.lines[0], ...overrides }];
  return renderToStaticMarkup(<FunderContractsTable contracts={[contract]} accountingYear={2026} initiallyExpanded={[contract.id]} />);
}

test("attention compares exact cents and detects a line over budget while the contract has remaining funds", () => {
  const markup = renderLine({ budget: "900719925474099.00", allocated_lifetime: "900719925474099.01", binding: "derived" });
  assert.match(markup, /Allocated above budget/);
  assert.match(markup, /1 line to review/);
  assert.match(markup, /R 1 100,00/);
  const equal = renderLine({ budget: "900719925474099.00", allocated_lifetime: "900719925474099.00", binding: "derived", row_count: 1 });
  assert.match(equal, /0 lines to review/);
});

test("zero net allocations do not imply no allocation rows or overdue spending", () => {
  for (const row_count of [2, null]) {
    const markup = renderLine({ budget: "200.00", allocated_lifetime: "0.00", binding: "derived", row_count });
    assert.doesNotMatch(markup, />No recorded allocation rows/);
    assert.match(markup, /0 lines to review/);
  }
  const empty = renderLine({ budget: "200.00", allocated_lifetime: "0.00", binding: "derived", row_count: 0 });
  assert.match(empty, />No recorded allocation rows/);
  assert.match(empty, /not evidence of overdue spending/);
});

test("typed allocations are identified as typed even when above budget; absent typed values are not zero", () => {
  const typed = renderLine({ binding: "asserted", budget: "200.00", allocated_asserted: "250.00", allocated_lifetime: null, row_count: null });
  assert.match(typed, /Typed allocation above budget/);
  assert.match(typed, /typed in the sheet/);
  const absent = renderLine({ binding: "asserted", budget: "200.00", allocated_asserted: null, allocated_lifetime: null, row_count: null });
  assert.match(absent, /no value/);
  assert.match(absent, /0 lines to review/);
});

test("missing line budgets surface without becoming zero budgets or forecasts", () => {
  const markup = renderLine({ budget: null, allocated_lifetime: "250.00", binding: "derived" });
  assert.match(markup, /Budget not set/);
  assert.match(markup, /1 line to review/);
  assert.doesNotMatch(markup, /Projected|days remaining|deadline/);
  assert.match(markup, /Expense drilldown for this exact contract line is not available yet/);
});

test("zero contract budgets retain the zero and mark percentage unavailable", () => {
  const contract = { ...snapshot.funder_contracts[0], budget_total: "0.00", remaining: "-5900.00", lines: [] };
  const markup = renderToStaticMarkup(<FunderContractsTable contracts={[contract]} accountingYear={2026} />);
  assert.match(markup, /R 0,00/);
  assert.match(markup, /not available/);
  assert.match(markup, /Allocated above budget/);
  assert.doesNotMatch(markup, /100.0%|Infinity/);
});

test("empty contract snapshots have an explicit empty state", () => {
  const markup = renderToStaticMarkup(<FunderContractsTable contracts={[]} accountingYear={2026} />);
  assert.match(markup, /No funder contracts in this snapshot/);
  assert.doesNotMatch(markup, /Needs a closer look/);
});

import { budgetDomTest, domPrelude } from "./budgetDomTest";
test("attention opens the matching contract line and moves keyboard focus to its source row", () => budgetDomTest(domPrelude + `
window.process={env:{}};
import fixture from './src/lib/finance/fixtures/finance-snapshot-example.json';
const contract=JSON.parse(JSON.stringify(fixture.funder_contracts[0]));
contract.lines=[{...contract.lines[0],category:'Infrastructure review',budget:'200.00',allocated_lifetime:'0.00',binding:'derived',row_count:0}];
window.result=(async()=>{try{
const {FunderContractsTable}=await import('./src/components/finance/FunderContractsTable');
root.render(<FunderContractsTable contracts={[contract]} accountingYear={2026}/>);
await until(()=>document.querySelector('[aria-label="Funder attention"] button'),'attention prompt');
const expand=document.querySelector('[aria-expanded]');check(expand.getAttribute('aria-expanded')==='false','initially collapsed');
document.querySelector('[aria-label="Funder attention"] button').click();
await until(()=>document.activeElement?.tagName==='TR','focused line');
check(expand.getAttribute('aria-expanded')==='true','contract expanded');
check(document.activeElement.textContent.includes('Infrastructure review'),'matching line focused');
check(document.activeElement.textContent.includes('Workbook row'),'source row preserved');
expand.click();await until(()=>expand.getAttribute('aria-expanded')==='false','collapse');
check(!document.querySelector('tbody'),'line table closed');
}finally{root.unmount();}})();
`));
