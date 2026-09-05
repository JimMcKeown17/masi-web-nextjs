import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { FinanceRunSelector } from "./FinanceRunSelector";
import { runFixture } from "./financeRunTestFixture";

test("selector labels candidates and failures, marks current, and preserves selected run across pages", () => {
  const selected = runFixture({ id: "older", status: "superseded" });
  const html = renderToStaticMarkup(<FinanceRunSelector year={2026} status="" selectedId="older" selectedRun={selected} runs={[
    runFixture(), runFixture({ id: "failed", status: "failed" }), runFixture({ id: "current", status: "approved" }),
  ]} currentId="current" onYearChange={() => {}} onStatusChange={() => {}} onRunChange={() => {}} />);
  assert.match(html, /Accounting year/);
  assert.match(html, /Run status/);
  assert.match(html, /candidate: /);
  assert.match(html, /failed: /);
  assert.match(html, /Current approved/);
  assert.match(html, /value="older" selected=""/);
  assert.match(html, /Reader figures use only the current approved run/);
});
