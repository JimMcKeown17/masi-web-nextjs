import type {
  BudgetProjection,
  BudgetScenario,
  ProjectionMonth,
  YouthBudgetCohort,
} from "@/lib/types/youth-budget";

const UIF_FACTOR = 1.01;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function allocateProportionally(
  eligible: number[],
  requested: number,
): number[] {
  const eligibleTotal = eligible.reduce((total, count) => total + count, 0);
  const target = Math.min(
    Math.max(0, Math.trunc(requested || 0)),
    eligibleTotal,
  );
  if (eligibleTotal === 0 || target === 0) {
    return eligible.map(() => 0);
  }

  const allocated = eligible.map((count) =>
    Math.floor((target * count) / eligibleTotal),
  );
  let remaining =
    target - allocated.reduce((total, count) => total + count, 0);
  const order = eligible
    .map((_, index) => ({
      index,
      remainder: (target * eligible[index]) % eligibleTotal,
    }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (const { index } of order) {
    if (remaining === 0) break;
    if (allocated[index] < eligible[index]) {
      allocated[index] += 1;
      remaining -= 1;
    }
  }
  return allocated;
}

// Mirrors the backend's two-pass split: subsidy-only converts (cost R0, they
// leave the costed population) are allocated first, then top-up conversions
// over the eligibility that remains.
function allocateNysConversions(
  cohorts: YouthBudgetCohort[],
  requested: number,
  subsidyOnly: number,
): { zeroCost: number[]; relief: number[] } {
  const eligible = cohorts.map((row) =>
    row.programme === "yebo" ? 0 : Math.max(0, row.nys_eligible_count),
  );
  const requestedTotal = Math.max(0, Math.trunc(requested || 0));
  const zeroTarget = Math.min(
    Math.max(0, Math.trunc(subsidyOnly || 0)),
    requestedTotal,
  );
  const zeroCost = allocateProportionally(eligible, zeroTarget);
  const remainingEligible = eligible.map(
    (count, index) => count - zeroCost[index],
  );
  const zeroAllocated = zeroCost.reduce((total, count) => total + count, 0);
  const relief = allocateProportionally(
    remainingEligible,
    requestedTotal - zeroAllocated,
  );
  return { zeroCost, relief };
}

export function calculateCommittedWhatIf(
  scenario: BudgetScenario,
  cohorts: YouthBudgetCohort[],
  savedMonths: ProjectionMonth[],
): BudgetProjection {
  const conversions = allocateNysConversions(
    cohorts,
    scenario.nys_conversion_count,
    scenario.nys_subsidy_only_count,
  );

  const months = savedMonths.map((savedMonth) => {
    let gross = 0;
    let uif = 0;
    let subsidyRelief = 0;

    cohorts.forEach((cohort, index) => {
      if (cohort.programme === "yebo") return;
      const matrixEntry =
        scenario.hours_matrix[cohort.site_type]?.[cohort.job_title];
      const hoursPerDay = Math.max(0, matrixEntry?.hours_per_day ?? 4.5);
      const daysPerWeek = Math.max(0, matrixEntry?.days_per_week ?? 5);
      let headcount = Math.max(0, cohort.headcount);
      // Subsidy-only converts leave the costed population from their month.
      if (savedMonth.month >= scenario.nys_conversion_start_month) {
        headcount = Math.max(0, headcount - conversions.zeroCost[index]);
      }
      if (headcount === 0) return;
      const utilisation =
        Math.max(1, Math.min(120, scenario.utilisation_pct || 100)) / 100;
      const grossPerHead =
        hoursPerDay *
        savedMonth.school_days *
        (daysPerWeek / 5) *
        Math.max(0, scenario.wage_rate) *
        utilisation;
      const rowGross = grossPerHead * headcount;
      const rowUif = rowGross * (UIF_FACTOR - 1);
      let subsidisedHeads = Math.max(0, cohort.subsidised_count);
      if (savedMonth.month >= scenario.nys_conversion_start_month) {
        subsidisedHeads += conversions.relief[index];
      }
      subsidisedHeads = Math.min(headcount, subsidisedHeads);
      const reliefPerHead = Math.min(
        Math.max(0, scenario.subsidy_contribution),
        grossPerHead * UIF_FACTOR,
      );

      gross += rowGross;
      uif += rowUif;
      subsidyRelief += reliefPerHead * subsidisedHeads;
    });

    return {
      month: savedMonth.month,
      school_days: savedMonth.school_days,
      gross: roundMoney(gross),
      uif: roundMoney(uif),
      subsidy_relief: roundMoney(subsidyRelief),
      net: roundMoney(gross + uif - subsidyRelief),
    };
  });

  return {
    months,
    total: roundMoney(
      months.reduce((total, month) => total + month.net, 0) +
        Math.max(0, scenario.holiday_pay),
    ),
    costed_youth: cohorts.reduce(
      (total, cohort) =>
        cohort.programme === "yebo"
          ? total
          : total + Math.max(0, cohort.headcount),
      0,
    ),
    open_posts: 0,
  };
}

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
    subsidy_contribution: scenario.subsidy_contribution,
    hours_matrix: scenario.hours_matrix,
    nys_conversion_count: scenario.nys_conversion_count,
    nys_subsidy_only_count: scenario.nys_subsidy_only_count,
    nys_conversion_start_month: scenario.nys_conversion_start_month,
    vacancy_start_month: scenario.vacancy_start_month,
    holiday_pay: scenario.holiday_pay,
    mentor_reserve: scenario.mentor_reserve,
    utilisation_pct: scenario.utilisation_pct,
  };
}
