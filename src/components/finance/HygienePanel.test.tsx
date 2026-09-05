import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { loadFixture } from "../../lib/finance/testFixture";
import { HygienePanel } from "./HygienePanel";

const markup = renderToStaticMarkup(<HygienePanel findings={loadFixture().findings} accountingYear={2026} />);

test("defaults to findings in the accounting year", () => {
  const order = ["MISSING_CONTRACT_KEY", "OVER_ALLOCATED_COVERAGE", "OVER_ALLOCATED_ROW", "WHITESPACE_KEY",
    "CATEGORY_NOT_IN_BLOCK", "ORPHAN_CONTRACT_KEY", "UNSCANNED_FUNDER_AMOUNT", "ASSERTED_LINE", "MISSING_BUDGET"]
    .map((code) => markup.indexOf(code));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.doesNotMatch(markup, /Outside 2026/);
  assert.doesNotMatch(markup, /block &#x27;Delta&#x27;/);
});

test("each group shows severity, count and the messages", () => {
  assert.match(markup, />error</);
  assert.match(markup, /Youth: funder allocations R5,150\.00 exceed spend R4,950\.00 by R200\.00\./);
  // In-scope and out-of-scope groups are separate, so every fixture group has exactly one finding.
  assert.doesNotMatch(markup, /\d+ findings/);
  assert.match(markup, /1 finding,/);
});

test("can reveal findings outside the accounting year", () => {
  const allMarkup = renderToStaticMarkup(
    <HygienePanel findings={loadFixture().findings} accountingYear={2026} includeOutOfScope />,
  );

  assert.match(allMarkup, /Outside 2026/);
  assert.match(allMarkup, /block &#x27;Delta&#x27;/);
});

test("1.1.0 findings retain every severity and historical scope", () => {
  const base = loadFixture().findings[0];
  const findings = (["TEXT_DATE", "MISSING_CONTRACT_PERIOD", "ORPHAN_CONTRACT_CODE", "PARSER_WARNING"] as const).flatMap((code) =>
    (["error", "warn", "info"] as const).flatMap((severity) => [true, false].map((in_scope_year) => ({ ...base, code, severity, in_scope_year, message: `${code}-${severity}-${in_scope_year}` }))));
  const html = renderToStaticMarkup(<HygienePanel findings={findings} accountingYear={2026} includeOutOfScope />);
  for (const finding of findings) assert.ok(html.includes(finding.message));
  for (const severity of ["error", "warn", "info"]) assert.match(html, new RegExp(`>${severity}<`));
});
