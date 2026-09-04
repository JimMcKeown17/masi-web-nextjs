import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { loadFixture } from "../../lib/finance/testFixture";
import { FinanceOverviewStatus } from "./FinanceOverviewStatus";

test("overview reports publication and exception status without presenting money KPIs", () => {
  const snapshot = loadFixture();
  const markup = renderToStaticMarkup(
    <FinanceOverviewStatus
      response={{
        accounting_year: 2026,
        run_id: snapshot.run_id,
        workbook_name: snapshot.source.workbook_name,
        workbook_date: snapshot.source.workbook_date,
        workbook_modified_at: snapshot.source.modified_at,
        workbook_sha256: snapshot.source.sha256,
        published_at: snapshot.published_at,
        loaded_at: snapshot.published_at,
        available_years: [2026],
        snapshot,
      }}
    />,
  );

  assert.match(markup, /Published funder snapshot/);
  assert.match(markup, />9<\/span> current-year findings/);
  assert.match(markup, /4 errors need attention/);
  assert.match(markup, />5<\/span> funder contracts/);
  assert.match(markup, />5<\/span> coverage groups/);
  assert.doesNotMatch(markup, /R 7 000,00/);
  assert.doesNotMatch(markup, /% used/);
});
