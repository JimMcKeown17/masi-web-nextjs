import type {
  MonthlyYouthExpenditure,
  SpendForecast,
} from "@/lib/types/youth-budget";

export interface ActualBar {
  kind: "actual";
  month: number;
  core: number;
  mentor: number;
  rural: number;
  total: number;
}

export interface ProjectedBar {
  kind: "projected";
  month: number;
  core: number;
  mentor: number;
  rural: number;
  total: number;
  workingDays: number;
  workingDates: string[];
}

export type ExpenditureChartBar = ActualBar | ProjectedBar;

export interface ExpenditureChartData {
  bars: ExpenditureChartBar[];
  lastActualMonth: number | null;
}

export function buildExpenditureChartData(
  expenditure: MonthlyYouthExpenditure[],
  forecast: SpendForecast,
): ExpenditureChartData {
  const actualByMonth = new Map(
    expenditure
      .filter((row) => row.month >= 1 && row.month <= 12)
      .map((row) => [row.month, row]),
  );
  const lastActualMonth =
    actualByMonth.size > 0 ? Math.max(...actualByMonth.keys()) : null;
  const actualBars = Array.from(
    { length: lastActualMonth ?? 0 },
    (_, index): ActualBar => {
      const month = index + 1;
      const row = actualByMonth.get(month);
      const core = row?.core_amount ?? 0;
      const mentor = row?.mentor_amount ?? 0;
      const rural = row?.rural_amount ?? 0;
      return {
        kind: "actual",
        month,
        core,
        mentor,
        rural,
        total: core + mentor + rural,
      };
    },
  );
  const projectedBars = forecast.months
    .filter(
      (row) => lastActualMonth === null || row.month > lastActualMonth,
    )
    .map(
      (row): ProjectedBar => ({
        kind: "projected",
        month: row.month,
        core: row.core_amount,
        mentor: row.mentor_amount,
        rural: row.rural_amount,
        total: row.total,
        workingDays: row.working_days,
        workingDates: row.working_dates,
      }),
    );

  return {
    bars: [...actualBars, ...projectedBars],
    lastActualMonth,
  };
}
