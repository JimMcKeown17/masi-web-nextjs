import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import type {
  BudgetScenario,
  SourceSubsidies,
} from "@/lib/types/youth-budget";
import { SourceSubsidyPanel } from "./LeversPanel";
import { editableScenarioFields } from "./projection";

const completeSource: SourceSubsidies = {
  policy: "informational_only",
  available: true,
  nys_tagged_active_employees: 125,
  sef_active_status_employees: 5,
  last_success_at: "2026-09-01T00:05:52Z",
  latest_attempt_succeeded: true,
  enrichment: {
    matched: 1898,
    missing_link: 0,
    multiple_links: 0,
    missing_target: 0,
  },
};

test("source panel labels Airtable counts as informational only", () => {
  const markup = renderToStaticMarkup(
    <SourceSubsidyPanel source={completeSource} />,
  );

  assert.match(markup, /role="status"/);
  assert.match(markup, /Informational only/);
  assert.match(markup, /Active employees tagged NYS in Airtable/);
  assert.match(markup, /Active employees tagged SEF with subsidy status Active/);
  assert.match(markup, /01 Sept 2026, 02:05 SAST/);
  assert.match(markup, /not added to, subtracted from, or otherwise used/);
});

test("unavailable source renders an alert and never substitutes zero", () => {
  const markup = renderToStaticMarkup(
    <SourceSubsidyPanel
      source={{
        ...completeSource,
        available: false,
        nys_tagged_active_employees: null,
        sef_active_status_employees: null,
        last_success_at: null,
        latest_attempt_succeeded: false,
        enrichment: null,
      }}
    />,
  );

  assert.match(markup, /role="alert"/);
  assert.match(markup, /remain unavailable rather than being shown as zero/);
  assert.doesNotMatch(markup, />0</);
});

test("editable scenario payload uses canonical scheme fields only", () => {
  const scenario = {
    wage_rate: 32.01,
    subsidy_contribution: 1900,
    nys_subsidy_contribution: 1900,
    nys_full_time_count: 127,
    nys_part_time_count: 41,
    nys_conversion_start_month: 9,
    nys_start_date: "2026-09-01",
    nys_end_date: "2026-12-31",
    sef_subsidy_contribution: 1400,
    sef_full_time_count: 200,
    sef_part_time_count: 0,
    sef_start_date: "2026-10-01",
    sef_end_date: "2027-03-31",
    hours_matrix: { primary: {}, ecd: {} },
    vacancy_start_month: 9,
    last_paid_programme_date: "2026-11-30",
    holiday_pay: 0,
    mentor_reserve: 0,
    utilisation_pct: 100,
  } as BudgetScenario;

  const payload = editableScenarioFields(scenario);

  assert.equal(payload.nys_subsidy_contribution, 1900);
  assert.equal(payload.sef_full_time_count, 200);
  assert.equal(payload.sef_end_date, "2027-03-31");
  assert.equal("subsidy_contribution" in payload, false);
  assert.equal("nys_conversion_start_month" in payload, false);
});
