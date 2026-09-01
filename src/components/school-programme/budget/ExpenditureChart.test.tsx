import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import type {
  MonthlyYouthExpenditure,
  SpendForecast,
} from "@/lib/types/youth-budget";
import { ExpenditureChart } from "./ExpenditureChart";

const expenditure: MonthlyYouthExpenditure[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: index + 1,
    year: 2026,
    month: index + 1,
    core_amount: 100 + index,
    mentor_amount: 10,
    rural_amount: 5,
    note: "fixture",
  }),
);

const forecast: SpendForecast = {
  mentor_estimate: {
    method: "average_latest_3_actual_months",
    monthly_amount: 107,
    source_actuals: [
      { month: 6, amount: 100 },
      { month: 7, amount: 110 },
      { month: 8, amount: 111 },
    ],
  },
  months: [8, 9, 10, 11].map((month) => ({
    month,
    working_days: month === 9 ? 17 : 20,
    working_dates: [`2026-${String(month).padStart(2, "0")}-01`],
    core_amount: 250,
    mentor_amount: 107,
    rural_amount: 25,
    total: 382,
  })),
};

test("renders August as actual and starts the projection in September", () => {
  const markup = renderToStaticMarkup(
    <ExpenditureChart expenditure={expenditure} forecast={forecast} />,
  );

  assert.match(markup, /Actual nett spend from January to August/);
  assert.match(markup, /August core/);
  assert.doesNotMatch(markup, /August projected/);
  assert.match(markup, /September projected/);
  assert.match(markup, /17 working days/);
  assert.match(markup, /Mentor estimate/);
  assert.match(markup, /average of June, July, and August actuals/);
  assert.match(markup, /September projected core/);
  assert.equal(markup.match(/>Actual<\/text>/g)?.length, 8);
  assert.equal(markup.match(/>Projected<\/text>/g)?.length, 3);
});
