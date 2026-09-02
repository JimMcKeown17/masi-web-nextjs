import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { loadFixture } from "../../lib/finance/testFixture";
import { AllocationCoverageTable } from "./AllocationCoverageTable";

const snapshot = loadFixture();
const markup = renderToStaticMarkup(
  <AllocationCoverageTable
    coverage={snapshot.allocation_coverage}
    caveats={snapshot.allocation_coverage_caveats}
    contracts={snapshot.funder_contracts}
    accountingYear={2026}
  />,
);

test("is titled allocation coverage and never project budget", () => {
  assert.match(markup, /Allocation coverage/);
  assert.doesNotMatch(markup, /project budget/i);
  assert.match(markup, /2026/);
});

test("over-allocation renders as an error, not a negative number", () => {
  const youth = markup.slice(markup.indexOf(">Youth<"));
  assert.match(youth, /over-allocated by R 200,00/);
  assert.doesNotMatch(youth.slice(0, youth.indexOf("</tr>")), /-R 200,00/);
});

test("lists the contracts funding each project by label and shows orphan money separately", () => {
  const literacy = markup.slice(markup.indexOf(">Literacy<"));
  const row = literacy.slice(0, literacy.indexOf("</tr>"));
  assert.match(row, /GAMMA-25-26/);
  assert.match(row, /R 800,00/);
  assert.match(row, /no owning contract: R 250,00/);
  assert.match(row, /Literacy, literacy/);
});

test("groups with ownerless money are badged; groups without are complete", () => {
  const youth = markup.slice(markup.indexOf(">Youth<"));
  assert.match(youth.slice(0, youth.indexOf("</tr>")), /unbound R 150,00/);
  const admin = markup.slice(markup.indexOf(">Admin<"));
  assert.match(admin.slice(0, admin.indexOf("</tr>")), />complete</);
});

test("typed lines on in-scope contracts are one banner over the table, not a badge on every row", () => {
  assert.match(markup, /Training.*R 250,00|R 250,00.*Training/);
  assert.equal((markup.match(/typed line/g) ?? []).length, 0);
  assert.match(markup, /could belong to any project/);
});

test("money with no contract key at all is shown as ownerless, not hidden", () => {
  const youth = markup.slice(markup.indexOf(">Youth<"));
  assert.match(youth.slice(0, youth.indexOf("</tr>")), /no owning contract: R 150,00/);
});

test("money in a funder column no budget block binds funds its project as ownerless and the row is incomplete", () => {
  const housing = markup.slice(markup.indexOf(">Housing<"));
  const row = housing.slice(0, housing.indexOf("</tr>"));
  assert.match(row, /no owning contract: R 500,00/);
  assert.match(row, /unbound R 500,00/);
  assert.doesNotMatch(row, />complete</);
});
