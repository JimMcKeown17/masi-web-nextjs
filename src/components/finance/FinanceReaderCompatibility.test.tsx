import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { FinanceSnapshot, FinanceSnapshotResponse } from "@/lib/types/finance";
import { getFinanceSnapshot } from "@/lib/api/finance";
import { FunderContractsTable } from "./FunderContractsTable";
import { AllocationCoverageTable } from "./AllocationCoverageTable";
import { FinanceContractDetail } from "./FinanceContractDetail";
import { FinanceOverviewStatus } from "./FinanceOverviewStatus";
import { HygienePanel } from "./HygienePanel";
import { ProvenanceStrip } from "./ProvenanceStrip";

for (const version of ["1.0.0", "1.1.0"] as const) {
  test(`snapshot ${version} keeps the API, Funders, Coverage, contract, Overview, provenance and Fix reader path`, async () => {
    const snapshot = JSON.parse(readFileSync(`src/lib/finance/fixtures/${version === "1.0.0" ? "finance-snapshot-example" : "finance-snapshot-1.1.0-example"}.json`, "utf8")) as FinanceSnapshot;
    const response: FinanceSnapshotResponse = {
      accounting_year: 2026, available_years: [2026], run_id: snapshot.run_id, snapshot,
      workbook_name: snapshot.source.workbook_name, workbook_date: snapshot.source.workbook_date,
      workbook_modified_at: snapshot.source.modified_at, workbook_sha256: snapshot.source.sha256,
      published_at: snapshot.published_at, loaded_at: snapshot.published_at,
    };
    const original = global.fetch;
    global.fetch = async (url) => { assert.match(String(url), /\/finance\/snapshot\//); return new Response(JSON.stringify(response)); };
    try { assert.deepEqual(await getFinanceSnapshot("token", 2026), response); } finally { global.fetch = original; }
    const html = renderToStaticMarkup(<>
      <FunderContractsTable contracts={snapshot.funder_contracts} accountingYear={2026} />
      <AllocationCoverageTable contracts={snapshot.funder_contracts} coverage={snapshot.allocation_coverage} caveats={snapshot.allocation_coverage_caveats} accountingYear={2026} />
      <FinanceContractDetail contracts={snapshot.funder_contracts} contractCode="ALPHA-26-27" accountingYear={2026} />
      <FinanceOverviewStatus response={response} /><ProvenanceStrip response={response} />
      <HygienePanel findings={snapshot.findings} accountingYear={2026} includeOutOfScope />
    </>);
    assert.match(html, /ALPHA-26-27/);
    assert.match(html, /Allocation coverage/);
    assert.match(html, /Published funder snapshot/);
    assert.match(html, /Outside 2026/);
    if (version === "1.1.0") for (const code of ["TEXT_DATE", "MISSING_CONTRACT_PERIOD", "ORPHAN_CONTRACT_CODE", "PARSER_WARNING"]) assert.match(html, new RegExp(code));
  });
}
