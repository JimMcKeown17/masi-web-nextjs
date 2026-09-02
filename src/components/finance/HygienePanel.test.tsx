import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { loadFixture } from "../../lib/finance/testFixture";
import { HygienePanel } from "./HygienePanel";

const markup = renderToStaticMarkup(<HygienePanel findings={loadFixture().findings} accountingYear={2026} />);

test("groups findings by code with in-scope groups first", () => {
  const order = ["MISSING_CONTRACT_KEY", "OVER_ALLOCATED_COVERAGE", "OVER_ALLOCATED_ROW", "WHITESPACE_KEY",
    "CATEGORY_NOT_IN_BLOCK", "ORPHAN_CONTRACT_KEY", "UNSCANNED_FUNDER_AMOUNT", "ASSERTED_LINE", "MISSING_BUDGET"]
    .map((code) => markup.indexOf(code));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(markup, /Outside 2026/);
});

test("each group shows severity, count and the messages", () => {
  assert.match(markup, />error</);
  assert.match(markup, /Youth: funder allocations R5,150\.00 exceed spend R4,950\.00 by R200\.00\./);
  // In-scope and out-of-scope groups are separate, so every fixture group has exactly one finding.
  assert.doesNotMatch(markup, /\d+ findings/);
  assert.match(markup, /1 finding,/);
});
