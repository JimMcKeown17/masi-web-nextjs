import assert from "node:assert/strict";
import test from "node:test";

import type {
  BudgetProjection,
  MonthlyYouthExpenditure,
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

const committed: BudgetProjection = {
  total: 600,
  costed_youth: 10,
  open_posts: 0,
  months: [
    {
      month: 8,
      school_days: 20,
      gross: 100,
      uif: 0,
      subsidy_relief: 0,
      net: 100,
    },
    {
      month: 9,
      school_days: 17,
      gross: 200,
      uif: 0,
      subsidy_relief: 0,
      net: 200,
    },
    {
      month: 10,
      school_days: 19,
      gross: 300,
      uif: 0,
      subsidy_relief: 0,
      net: 300,
    },
  ],
};

test("actuals run through the latest published month and projections follow", () => {
  const result = buildExpenditureChartData(
    [actual(8, 80, 8, 2), actual(1, 10)],
    committed,
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
});

test("without actuals the available projection series is retained", () => {
  const result = buildExpenditureChartData([], committed);

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
    committed,
  );

  assert.equal(result.lastActualMonth, 6);
  assert.equal(result.bars.filter((bar) => bar.kind === "actual").length, 6);
});
