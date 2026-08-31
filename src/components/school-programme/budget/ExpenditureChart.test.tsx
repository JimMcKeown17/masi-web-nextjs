import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import type {
  BudgetProjection,
  MonthlyYouthExpenditure,
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

const committed: BudgetProjection = {
  total: 1000,
  costed_youth: 10,
  open_posts: 0,
  months: [8, 9, 10, 11].map((month) => ({
    month,
    school_days: 20,
    gross: 250,
    uif: 0,
    subsidy_relief: 0,
    net: 250,
  })),
};

test("renders August as actual and starts the projection in September", () => {
  const markup = renderToStaticMarkup(
    <ExpenditureChart expenditure={expenditure} committed={committed} />,
  );

  assert.match(markup, /Actual nett spend from January to August/);
  assert.match(markup, /August core/);
  assert.doesNotMatch(markup, /August projected/);
  assert.match(markup, /September projected/);
  assert.equal(markup.match(/>Actual<\/text>/g)?.length, 8);
  assert.equal(markup.match(/>Projected<\/text>/g)?.length, 3);
});
