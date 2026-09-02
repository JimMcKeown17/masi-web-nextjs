import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { loadFixture } from "../../lib/finance/testFixture";
import { ProvenanceStrip } from "./ProvenanceStrip";

const response = {
  accounting_year: 2026,
  run_id: "2026-09-01T12:00:00Z-0a1b2c",
  workbook_name: "20260831 - Fixture Management Accounts.xlsx",
  workbook_date: "2026-08-31",
  workbook_modified_at: "2026-09-01T11:59:00Z",
  workbook_sha256: "0123456789abcdef".repeat(4),
  published_at: "2026-09-01T12:00:00Z",
  loaded_at: "2026-09-01T12:05:00+00:00",
  available_years: [2026],
  snapshot: loadFixture(),
};

test("provenance strip names the workbook, short hash, dates, and the year predicate in words", () => {
  const markup = renderToStaticMarkup(<ProvenanceStrip response={response} />);
  assert.match(markup, /20260831 - Fixture Management Accounts\.xlsx/);
  assert.match(markup, /0123456789ab/);
  assert.doesNotMatch(markup, /0123456789abcdef0123456789abcdef/);
  assert.match(markup, /Expenditure rows where Year = 2026/);
  assert.match(markup, /2026-09-01T12:00:00Z/);
  assert.match(markup, /money in funder columns no budget block binds is counted as owned by nobody and flagged/);
});
