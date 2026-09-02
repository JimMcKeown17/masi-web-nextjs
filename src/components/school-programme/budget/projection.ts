import type { BudgetScenario } from "@/lib/types/youth-budget";

export function cloneScenario(scenario: BudgetScenario): BudgetScenario {
  return {
    ...scenario,
    hours_matrix: {
      primary: Object.fromEntries(
        Object.entries(scenario.hours_matrix.primary ?? {}).map(
          ([title, entry]) => [title, { ...entry }],
        ),
      ),
      ecd: Object.fromEntries(
        Object.entries(scenario.hours_matrix.ecd ?? {}).map(
          ([title, entry]) => [title, { ...entry }],
        ),
      ),
    },
  };
}

export function editableScenarioFields(scenario: BudgetScenario) {
  return {
    wage_rate: scenario.wage_rate,
    nys_subsidy_contribution: scenario.nys_subsidy_contribution,
    hours_matrix: scenario.hours_matrix,
    nys_full_time_count: scenario.nys_full_time_count,
    nys_part_time_count: scenario.nys_part_time_count,
    nys_start_date: scenario.nys_start_date,
    nys_end_date: scenario.nys_end_date,
    sef_subsidy_contribution: scenario.sef_subsidy_contribution,
    sef_full_time_count: scenario.sef_full_time_count,
    sef_part_time_count: scenario.sef_part_time_count,
    sef_start_date: scenario.sef_start_date,
    sef_end_date: scenario.sef_end_date,
    vacancy_start_month: scenario.vacancy_start_month,
    last_paid_programme_date: scenario.last_paid_programme_date,
    holiday_pay: scenario.holiday_pay,
    mentor_reserve: scenario.mentor_reserve,
    utilisation_pct: scenario.utilisation_pct,
  };
}
