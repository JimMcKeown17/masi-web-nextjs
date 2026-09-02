import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { loadFixture } from "../../lib/finance/testFixture";
import { FunderContractsTable } from "./FunderContractsTable";

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
