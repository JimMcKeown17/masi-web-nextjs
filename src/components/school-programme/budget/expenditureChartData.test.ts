import assert from "node:assert/strict";
import test from "node:test";

import type {
  MonthlyYouthExpenditure,
  SpendForecast,
} from "@/lib/types/youth-budget";
import { buildExpenditureChartData } from "./expenditureChartData";

function actual(
  month: number,
  core: number,
  mentor = 0,
  rural = 0,
): MonthlyYouthExpenditure {
  return {
    id: month,
    year: 2026,
    month,
    core_amount: core,
    mentor_amount: mentor,
    rural_amount: rural,
    note: "fixture",
  };
}

const forecast: SpendForecast = {
  mentor_estimate: {
    method: "average_latest_3_actual_months",
    monthly_amount: 10,
    source_actuals: [],
  },
  months: [
    {
      month: 8,
      working_days: 20,
      working_dates: ["2026-08-03"],
      core_amount: 100,
      mentor_amount: 10,
      rural_amount: 5,
      total: 115,
    },
    {
      month: 9,
      working_days: 17,
      working_dates: ["2026-09-01", "2026-09-23"],
      core_amount: 200,
      mentor_amount: 10,
      rural_amount: 5,
      total: 215,
    },
    {
      month: 10,
      working_days: 19,
      working_dates: ["2026-10-06", "2026-10-30"],
      core_amount: 300,
      mentor_amount: 10,
      rural_amount: 5,
      total: 315,
    },
  ],
};

test("actuals run through the latest published month and projections follow", () => {
  const result = buildExpenditureChartData(
    [actual(8, 80, 8, 2), actual(1, 10)],
    forecast,
  );

  assert.equal(result.lastActualMonth, 8);
  assert.deepEqual(
    result.bars.map((bar) => [bar.kind, bar.month]),
    [
      ["actual", 1],
      ["actual", 2],
      ["actual", 3],
      ["actual", 4],
      ["actual", 5],
      ["actual", 6],
      ["actual", 7],
      ["actual", 8],
      ["projected", 9],
      ["projected", 10],
    ],
  );
  assert.deepEqual(result.bars[1], {
    kind: "actual",
    month: 2,
    core: 0,
    mentor: 0,
    rural: 0,
    total: 0,
  });
  assert.deepEqual(result.bars[7], {
    kind: "actual",
    month: 8,
    core: 80,
    mentor: 8,
    rural: 2,
    total: 90,
  });
  assert.deepEqual(result.bars[8], {
    kind: "projected",
    month: 9,
    core: 200,
    mentor: 10,
    rural: 5,
    total: 215,
    workingDays: 17,
    workingDates: ["2026-09-01", "2026-09-23"],
  });
});

test("without actuals the available projection series is retained", () => {
  const result = buildExpenditureChartData([], forecast);

  assert.equal(result.lastActualMonth, null);
  assert.deepEqual(
    result.bars.map((bar) => [bar.kind, bar.month]),
    [
      ["projected", 8],
      ["projected", 9],
      ["projected", 10],
    ],
  );
});

test("invalid expenditure months cannot move the actual boundary", () => {
  const result = buildExpenditureChartData(
    [actual(0, 1), actual(13, 1), actual(6, 50)],
    forecast,
  );

  assert.equal(result.lastActualMonth, 6);
  assert.equal(result.bars.filter((bar) => bar.kind === "actual").length, 6);
});
