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
  is_ringfenced: boolean;
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
  // Deprecated backend aliases retained during the expand-contract release.
  subsidy_contribution: number;
  hours_matrix: HoursMatrix;
  // Additive NYS split: total subsidised jobs = full-time + part-time.
  nys_full_time_count: number;
  // Part-timers who earn only their NYS funding; cost Masi R0.
  nys_part_time_count: number;
  nys_conversion_start_month: number;
  nys_subsidy_contribution: number;
  nys_start_date: string;
  nys_end_date: string;
  sef_subsidy_contribution: number;
  sef_full_time_count: number;
  sef_part_time_count: number;
  sef_start_date: string;
  sef_end_date: string;
  vacancy_start_month: number;
  last_paid_programme_date: string;
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
  working_dates: string[];
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
  current_core_youth: number;
  open_posts: number;
}

export interface SubsidySchemePlan {
  contribution: number;
  start_date: string;
  end_date: string;
  requested_full_time: number;
  requested_part_time: number;
  requested_total: number;
  modelled_full_time: number;
  modelled_part_time: number;
  modelled_total: number;
  unmodelled_total: number;
}

export interface SubsidyPlan {
  policy: "theoretical_only";
  eligible_current_youth: number;
  requested_total: number;
  modelled_total: number;
  unmodelled_total: number;
  schemes: {
    nys: SubsidySchemePlan;
    sef: SubsidySchemePlan;
  };
}

export interface SourceSubsidies {
  policy: "informational_only";
  available: boolean;
  nys_tagged_active_employees: number | null;
  sef_active_status_employees: number | null;
  last_success_at: string | null;
  latest_attempt_succeeded: boolean;
  enrichment: {
    matched: number;
    missing_link: number;
    multiple_links: number;
    missing_target: number;
  } | null;
}

export interface YouthBudgetProjections {
  committed: BudgetProjection;
  at_plan: BudgetProjection;
  verdict_committed: number;
  verdict_at_plan: number;
}

export interface MentorActualSource {
  month: number;
  amount: number;
}

export interface MentorEstimate {
  method: "average_latest_3_actual_months";
  monthly_amount: number;
  source_actuals: MentorActualSource[];
}

export interface SpendForecastMonth {
  month: number;
  working_days: number;
  working_dates: string[];
  core_amount: number;
  mentor_amount: number;
  rural_amount: number;
  total: number;
}

export interface SpendForecast {
  months: SpendForecastMonth[];
  mentor_estimate: MentorEstimate;
}

export interface YouthBudgetPreview {
  subsidy_plan: SubsidyPlan;
  projections: YouthBudgetProjections;
  ringfenced_projections: {
    committed: BudgetProjection;
    at_plan: BudgetProjection;
  };
  ringfenced_pots: RingfencedPot[];
  spend_forecast: SpendForecast;
  feasibility: FundingFeasibility[];
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

export interface RingfencedPot {
  funder_name: string;
  amount: number;
  schools: string[];
  costed_youth: number;
  open_posts: number;
  projected_committed: number;
  projected_at_plan: number;
  surplus: number;
}

export interface YouthBudgetNotes {
  active_total: number;
  school_less: number;
  yebo_shown_only: number;
  ringfenced: number;
}

export interface YouthBudgetSummary {
  year: number;
  as_of: string;
  pots: FundingPot[];
  pots_total: number;
  scenario: BudgetScenario;
  subsidy_plan: SubsidyPlan;
  source_subsidies: SourceSubsidies;
  cohorts: YouthBudgetCohort[];
  projections: YouthBudgetProjections;
  spend_forecast: SpendForecast;
  expenditure: MonthlyYouthExpenditure[];
  feasibility: FundingFeasibility[];
  ringfenced: {
    pots: RingfencedPot[];
    total_amount: number;
    youth: number;
    projections: {
      committed: BudgetProjection;
      at_plan: BudgetProjection;
    };
  };
  notes: YouthBudgetNotes;
  school_options: YouthBudgetSchool[];
}

type ScenarioEditableFields = Pick<
  BudgetScenario,
  | "wage_rate"
  | "nys_subsidy_contribution"
  | "hours_matrix"
  | "nys_full_time_count"
  | "nys_part_time_count"
  | "nys_start_date"
  | "nys_end_date"
  | "sef_subsidy_contribution"
  | "sef_full_time_count"
  | "sef_part_time_count"
  | "sef_start_date"
  | "sef_end_date"
  | "vacancy_start_month"
  | "last_paid_programme_date"
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
  is_ringfenced?: boolean;
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
