export type YouthBudgetSiteType = "primary" | "ecd";

export interface YouthBudgetSchool {
  id: number;
  name: string;
}

export interface FundingPot {
  id: number;
  year: number;
  funder_name: string;
  amount: number;
  as_of: string;
  note: string;
  schools: YouthBudgetSchool[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HoursMatrixEntry {
  hours_per_day: number;
  days_per_week: number;
}

export type HoursMatrix = Record<
  YouthBudgetSiteType,
  Record<string, HoursMatrixEntry>
>;

export interface BudgetScenario {
  id: number;
  year: number;
  wage_rate: number;
  subsidy_contribution: number;
  hours_matrix: HoursMatrix;
  nys_conversion_count: number;
  // Of the conversions, subsidy-only part-timers who cost Masi R0.
  nys_subsidy_only_count: number;
  nys_conversion_start_month: number;
  vacancy_start_month: number;
  holiday_pay: number;
  mentor_reserve: number;
  // Average share of full-cap hours actually worked (absenteeism etc.), 1-120.
  utilisation_pct: number;
  updated_by: string;
  updated_at: string;
}

export interface YouthBudgetCohort {
  site_type: YouthBudgetSiteType;
  job_title: string;
  programme: string | null;
  headcount: number;
  subsidised_count: number;
  nys_eligible_count: number;
}

export interface ProjectionMonth {
  month: number;
  school_days: number;
  gross: number;
  uif: number;
  subsidy_relief: number;
  net: number;
}

export interface BudgetProjection {
  months: ProjectionMonth[];
  total: number;
  // Costed population, so the UI can explain why at-plan exceeds the
  // currently-employed projection (the job numbers).
  costed_youth: number;
  open_posts: number;
}

export interface YouthBudgetProjections {
  committed: BudgetProjection;
  at_plan: BudgetProjection;
  verdict_committed: number;
  verdict_at_plan: number;
}

export interface MonthlyYouthExpenditure {
  id: number;
  year: number;
  month: number;
  core_amount: number;
  mentor_amount: number;
  rural_amount: number;
  note: string;
}

export interface FundingFeasibility {
  funder_name: string;
  amount: number;
  projected_at_schools: number;
  shortfall: number;
  schools: string[];
}

export interface YouthBudgetNotes {
  active_total: number;
  school_less: number;
  yebo_shown_only: number;
}

export interface YouthBudgetSummary {
  year: number;
  as_of: string;
  pots: FundingPot[];
  pots_total: number;
  scenario: BudgetScenario;
  cohorts: YouthBudgetCohort[];
  projections: YouthBudgetProjections;
  expenditure: MonthlyYouthExpenditure[];
  feasibility: FundingFeasibility[];
  notes: YouthBudgetNotes;
  school_options: YouthBudgetSchool[];
}

type ScenarioEditableFields = Pick<
  BudgetScenario,
  | "wage_rate"
  | "subsidy_contribution"
  | "hours_matrix"
  | "nys_conversion_count"
  | "nys_subsidy_only_count"
  | "nys_conversion_start_month"
  | "vacancy_start_month"
  | "holiday_pay"
  | "mentor_reserve"
  | "utilisation_pct"
>;

export type BudgetScenarioUpdate = { year: number } & Partial<ScenarioEditableFields>;

export interface FundingPotCreate {
  year: number;
  funder_name: string;
  amount: number;
  as_of: string;
  note?: string;
  schools?: number[];
  is_active?: boolean;
}

export type FundingPotUpdate = Partial<FundingPotCreate>;

export interface YouthExpenditureCreate {
  year: number;
  month: number;
  core_amount?: number;
  mentor_amount?: number;
  rural_amount?: number;
  note?: string;
}

export type YouthExpenditureUpdate = Partial<YouthExpenditureCreate>;
