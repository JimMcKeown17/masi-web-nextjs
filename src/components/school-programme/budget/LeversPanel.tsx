"use client";

import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  BudgetProjection,
  BudgetScenario,
  BudgetScenarioUpdate,
  HoursMatrixEntry,
  SourceSubsidies,
  SubsidyPlan,
  SubsidySchemePlan,
  YouthBudgetSiteType,
} from "@/lib/types/youth-budget";
import {
  cloneScenario,
  editableScenarioFields,
} from "./projection";
import {
  formatBudgetDate,
  formatMonth,
  formatRand,
  formatSastDateTime,
  verdictLanguage,
} from "./format";

const MONTH_OPTIONS = [7, 8, 9, 10, 11];
const SITE_TYPES: YouthBudgetSiteType[] = ["primary", "ecd"];

type NumberField =
  | "wage_rate"
  | "nys_subsidy_contribution"
  | "nys_full_time_count"
  | "nys_part_time_count"
  | "sef_subsidy_contribution"
  | "sef_full_time_count"
  | "sef_part_time_count"
  | "utilisation_pct"
  | "holiday_pay"
  | "mentor_reserve";

function NumberLever({
  id,
  label,
  value,
  onChange,
  step = 1,
  prefix,
  help,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  prefix?: string;
  help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {prefix}
          </span>
        ) : null}
        <Input
          id={id}
          aria-describedby={help ? `${id}-help` : undefined}
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={prefix ? "pl-8 tabular-nums" : "tabular-nums"}
        />
      </div>
      {help ? (
        <p id={`${id}-help`} className="text-[11px] leading-relaxed text-gray-500">
          {help}
        </p>
      ) : null}
    </div>
  );
}

function MonthLever({
  id,
  label,
  value,
  onChange,
  help,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </Label>
      <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTH_OPTIONS.map((month) => (
            <SelectItem key={month} value={String(month)}>
              {formatMonth(month, "long")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {help ? <p className="text-[11px] leading-relaxed text-gray-500">{help}</p> : null}
    </div>
  );
}

function DateLever({
  id,
  label,
  value,
  min,
  max,
  onChange,
  help,
}: {
  id: string;
  label: string;
  value: string;
  min: string;
  max: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </Label>
      <Input
        id={id}
        type="date"
        min={min}
        max={max}
        value={value}
        aria-describedby={help ? `${id}-help` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {help ? (
        <p id={`${id}-help`} className="text-[11px] leading-relaxed text-gray-500">
          {help}
        </p>
      ) : null}
    </div>
  );
}

function VerdictTile({
  eyebrow,
  verdict,
  cost,
  live,
}: {
  eyebrow: string;
  verdict: number;
  cost: number;
  live?: boolean;
}) {
  const language = verdictLanguage(verdict);
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        live
          ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
          : "border-[#14181D]/15 bg-white text-[#14181D]",
      )}
    >
      <p
        className={cn(
          "text-[11px] uppercase tracking-[0.18em]",
          live ? "text-white/70" : "text-gray-500",
        )}
      >
        {eyebrow}
      </p>
      <p className="mt-2 font-serif text-2xl leading-tight">{language.phrase}</p>
      <p className={cn("mt-1 text-xs", live ? "text-white/70" : "text-gray-500")}>
        {formatRand(cost)} currently employed cost
      </p>
    </div>
  );
}

export function SourceSubsidyPanel({ source }: { source: SourceSubsidies }) {
  const warning = !source.available || !source.latest_attempt_succeeded;
  return (
    <div
      role={warning ? "alert" : "status"}
      className={cn(
        "rounded-xl border p-4 md:p-5",
        warning
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : "border-[#1D4ED8]/20 bg-[#1D4ED8]/5 text-[#14181D]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
            Airtable source check
          </p>
          <p className="mt-1 text-xs font-medium">Informational only</p>
        </div>
        {source.last_success_at ? (
          <p className="text-xs tabular-nums">
            Last complete sync {formatSastDateTime(source.last_success_at)}
          </p>
        ) : null}
      </div>

      {source.available ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-current/10 bg-white/70 p-3">
            <p className="text-xs leading-relaxed">
              Active employees tagged NYS in Airtable
            </p>
            <p className="mt-1 font-serif text-3xl tabular-nums text-[#1D4ED8]">
              {source.nys_tagged_active_employees}
            </p>
          </div>
          <div className="rounded-lg border border-current/10 bg-white/70 p-3">
            <p className="text-xs leading-relaxed">
              Active employees tagged SEF with subsidy status Active
            </p>
            <p className="mt-1 font-serif text-3xl tabular-nums text-[#1D4ED8]">
              {source.sef_active_status_employees}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed">
          No complete linked-table subsidy sync has been published yet. Counts
          remain unavailable rather than being shown as zero.
        </p>
      )}

      {source.available && !source.latest_attempt_succeeded ? (
        <p className="mt-3 text-sm leading-relaxed">
          The newest sync attempt did not complete subsidy enrichment. These are
          the last complete counts and may be stale.
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-relaxed opacity-75">
        These source tags are not added to, subtracted from, or otherwise used
        in the V1 theoretical projection.
      </p>
    </div>
  );
}

function SubsidyScenarioCard({
  scheme,
  contribution,
  fullTime,
  partTime,
  startDate,
  endDate,
  plan,
  scenarioYear,
  onContribution,
  onFullTime,
  onPartTime,
  onStartDate,
  onEndDate,
  onUseSuggestion,
}: {
  scheme: "NYS" | "SEF";
  contribution: number;
  fullTime: number;
  partTime: number;
  startDate: string;
  endDate: string;
  plan: SubsidySchemePlan;
  scenarioYear: number;
  onContribution: (value: number) => void;
  onFullTime: (value: number) => void;
  onPartTime: (value: number) => void;
  onStartDate: (value: string) => void;
  onEndDate: (value: string) => void;
  onUseSuggestion?: () => void;
}) {
  const total = Math.max(0, Math.trunc(fullTime || 0)) +
    Math.max(0, Math.trunc(partTime || 0));
  const prefix = scheme.toLowerCase();
  return (
    <article className="rounded-xl border border-[#14181D]/10 bg-[#FAF7F2] p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#1D4ED8]">
            {scheme} theoretical cohort
          </p>
          <h4 className="mt-1 font-serif text-2xl text-[#14181D]">
            Total {scheme} Jobs: <span className="text-[#1D4ED8]">{total}</span>
          </h4>
        </div>
        {onUseSuggestion ? (
          <Button type="button" variant="outline" size="sm" onClick={onUseSuggestion}>
            Use planned 200
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <NumberLever
          id={`${prefix}-contribution`}
          label="Monthly contribution"
          value={contribution}
          onChange={onContribution}
          prefix="R"
        />
        <NumberLever
          id={`${prefix}-full-time`}
          label="Full Time"
          value={fullTime}
          onChange={onFullTime}
          help="Masi pays wages and UIF less this scheme's monthly contribution."
        />
        <NumberLever
          id={`${prefix}-part-time`}
          label="Part-Time"
          value={partTime}
          onChange={onPartTime}
          help="Subsidy-only youth cost Masi R0 from their start and do not re-enter payroll automatically."
        />
        <DateLever
          id={`${prefix}-start-date`}
          label={`${scheme} Start Date`}
          value={startDate}
          min={`${scenarioYear}-01-01`}
          max={`${scenarioYear}-12-31`}
          onChange={onStartDate}
        />
        <DateLever
          id={`${prefix}-end-date`}
          label={`${scheme} End Date`}
          value={endDate}
          min={`${scenarioYear}-01-01`}
          max={`${scenarioYear + 1}-12-31`}
          onChange={onEndDate}
          help="Stops full-time relief. It does not reverse subsidy-only payroll removal."
        />
      </div>

      <div className="mt-4 grid gap-2 rounded-lg border bg-white p-3 text-sm sm:grid-cols-3">
        <p><span className="text-gray-500">Requested</span> <strong>{plan.requested_total}</strong></p>
        <p><span className="text-gray-500">Modelled</span> <strong>{plan.modelled_total}</strong></p>
        <p className={plan.unmodelled_total > 0 ? "text-amber-800" : undefined}>
          <span className="text-gray-500">Requires future hires</span>{" "}
          <strong>{plan.unmodelled_total}</strong>
        </p>
      </div>
    </article>
  );
}

function HoursMatrixTable({
  siteType,
  rows,
  onChange,
}: {
  siteType: YouthBudgetSiteType;
  rows: Record<string, HoursMatrixEntry>;
  onChange: (
    siteType: YouthBudgetSiteType,
    title: string,
    field: keyof HoursMatrixEntry,
    value: number,
  ) => void;
}) {
  const entries = Object.entries(rows).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b bg-[#FAF7F2] px-4 py-3">
        <h4 className="font-medium capitalize text-[#14181D]">
          {siteType === "ecd" ? "ECD" : "Primary"} sites
        </h4>
      </div>
      {entries.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          No job titles are configured for this site type.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[430px] text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2 font-medium">Job title</th>
                <th className="px-3 py-2 text-right font-medium">Hours per day</th>
                <th className="px-4 py-2 text-right font-medium">Days per week</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([title, entry]) => (
                <tr key={title} className="border-b last:border-0">
                  <td className="px-4 py-2.5 capitalize">{title}</td>
                  <td className="px-3 py-2">
                    <Input
                      aria-label={`${title} hours per day at ${siteType} sites`}
                      type="number"
                      min={0}
                      step={0.5}
                      value={entry.hours_per_day}
                      onChange={(event) =>
                        onChange(
                          siteType,
                          title,
                          "hours_per_day",
                          Number(event.target.value),
                        )
                      }
                      className="ml-auto w-24 text-right tabular-nums"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      aria-label={`${title} days per week at ${siteType} sites`}
                      type="number"
                      min={0}
                      max={7}
                      step={0.5}
                      value={entry.days_per_week}
                      onChange={(event) =>
                        onChange(
                          siteType,
                          title,
                          "days_per_week",
                          Number(event.target.value),
                        )
                      }
                      className="ml-auto w-24 text-right tabular-nums"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function LeversPanel({
  scenario,
  draft,
  savedCommitted,
  savedAtPlan,
  savedVerdictCommitted,
  savedVerdictAtPlan,
  liveCommitted,
  liveAtPlan,
  liveVerdictCommitted,
  liveVerdictAtPlan,
  subsidyPlan,
  sourceSubsidies,
  asOf,
  canEdit,
  dirty,
  previewing,
  onDraftChange,
  onSave,
}: {
  scenario: BudgetScenario;
  draft: BudgetScenario;
  savedCommitted: BudgetProjection;
  savedAtPlan: BudgetProjection;
  savedVerdictCommitted: number;
  savedVerdictAtPlan: number;
  liveCommitted: BudgetProjection;
  liveAtPlan: BudgetProjection;
  liveVerdictCommitted: number;
  liveVerdictAtPlan: number;
  subsidyPlan: SubsidyPlan;
  sourceSubsidies: SourceSubsidies;
  asOf: string;
  canEdit: boolean;
  dirty: boolean;
  previewing: boolean;
  onDraftChange: (draft: BudgetScenario) => void;
  onSave: (fields: Omit<BudgetScenarioUpdate, "year">) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  function updateNumber(field: NumberField, value: number) {
    const normalized =
      field === "nys_full_time_count" ||
      field === "nys_part_time_count" ||
      field === "sef_full_time_count" ||
      field === "sef_part_time_count" ||
      field === "utilisation_pct"
        ? Math.trunc(value)
        : value;
    onDraftChange({
      ...draft,
      [field]: Number.isFinite(normalized) ? Math.max(0, normalized) : 0,
    });
  }

  function updateMonth(
    field: "vacancy_start_month",
    value: number,
  ) {
    onDraftChange({ ...draft, [field]: value });
  }

  function updateDate(
    field: "nys_start_date" | "nys_end_date" | "sef_start_date" | "sef_end_date",
    value: string,
  ) {
    onDraftChange({ ...draft, [field]: value });
  }

  function updateHours(
    siteType: YouthBudgetSiteType,
    title: string,
    field: keyof HoursMatrixEntry,
    value: number,
  ) {
    onDraftChange({
      ...draft,
      hours_matrix: {
        ...draft.hours_matrix,
        [siteType]: {
          ...draft.hours_matrix[siteType],
          [title]: {
            ...draft.hours_matrix[siteType][title],
            [field]: Number.isFinite(value) ? Math.max(0, value) : 0,
          },
        },
      },
    });
  }

  function setAllDays(value: 4 | 5) {
    onDraftChange({
      ...draft,
      hours_matrix: {
        primary: Object.fromEntries(
          Object.entries(draft.hours_matrix.primary).map(([title, entry]) => [
            title,
            { ...entry, days_per_week: value },
          ]),
        ),
        ecd: Object.fromEntries(
          Object.entries(draft.hours_matrix.ecd).map(([title, entry]) => [
            title,
            { ...entry, days_per_week: value },
          ]),
        ),
      },
    });
  }

  async function saveScenario() {
    if (!canEdit || !dirty) return;
    setSaving(true);
    try {
      await onSave(editableScenarioFields(draft));
      toast.success("Budget scenario saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save the scenario.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b bg-[#14181D] px-5 py-5 text-white md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">
              Live what-if
            </p>
            <h2 className="mt-2 font-serif text-3xl">
              Move the <span className="italic text-[#93B4FF]">levers</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
              Every control asks the backend to recalculate both currently
              employed and at-plan costs. Nothing is shared with the team until
              an authorised user saves.
            </p>
          </div>
          <div className="text-right text-xs text-white/60">
            <p>Saved by {scenario.updated_by || "the system"}</p>
            <p>{formatBudgetDate(scenario.updated_at.slice(0, 10))}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-5 md:p-6">
        <div className="grid gap-3 lg:grid-cols-3">
          <VerdictTile
            eyebrow="Saved verdict, currently employed"
            verdict={savedVerdictCommitted}
            cost={savedCommitted.total}
          />
          <VerdictTile
            eyebrow={dirty ? "Live currently employed" : "Live matches saved"}
            verdict={liveVerdictCommitted}
            cost={liveCommitted.total}
            live
          />
          <VerdictTile
            eyebrow={dirty ? "Live at plan" : "Saved at plan"}
            verdict={dirty ? liveVerdictAtPlan : savedVerdictAtPlan}
            cost={dirty ? liveAtPlan.total : savedAtPlan.total}
            live={dirty}
          />
        </div>

        {previewing ? (
          <div className="rounded-lg border border-dashed border-[#1D4ED8]/30 bg-[#1D4ED8]/5 px-4 py-3 text-sm text-gray-700">
            Recalculating core, rural, mentor, currently employed, and at-plan
            figures from the draft scenario.
          </div>
        ) : null}

        <SourceSubsidyPanel source={sourceSubsidies} />

        <div>
          <h3 className="text-sm font-semibold text-[#14181D]">
            Organisation levers
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            The calculation uses {formatBudgetDate(asOf)} as its start date and
            exact school dates supplied by the backend.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberLever
              id="budget-wage-rate"
              label="Wage Rate per hour"
              value={draft.wage_rate}
              onChange={(value) => updateNumber("wage_rate", value)}
              step={0.01}
              prefix="R"
            />
            <NumberLever
              id="budget-utilisation"
              label="Utilisation %"
              value={draft.utilisation_pct}
              onChange={(value) => updateNumber("utilisation_pct", value)}
              step={1}
              help="Average share of full-cap hours actually worked. 100 is the conservative full-attendance assumption."
            />
            <MonthLever
              id="budget-vacancy-start"
              label="Open Posts Assumed Filled From"
              value={draft.vacancy_start_month}
              onChange={(value) => updateMonth("vacancy_start_month", value)}
              help="Only affects the at-plan cost of open Planned Posts. It does not assign subsidies to vacancies."
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#14181D]">
                Subsidy planning
              </h3>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-500">
                Complete theoretical cohorts applied to current core youth. NYS
                and SEF share one pool, so the same modelled youth is never
                counted in both schemes.
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Eligible current core youth: {subsidyPlan.eligible_current_youth}
            </p>
          </div>

          <div className="mt-4 space-y-4">
            <SubsidyScenarioCard
              scheme="NYS"
              contribution={draft.nys_subsidy_contribution}
              fullTime={draft.nys_full_time_count}
              partTime={draft.nys_part_time_count}
              startDate={draft.nys_start_date}
              endDate={draft.nys_end_date}
              plan={subsidyPlan.schemes.nys}
              scenarioYear={draft.year}
              onContribution={(value) => updateNumber("nys_subsidy_contribution", value)}
              onFullTime={(value) => updateNumber("nys_full_time_count", value)}
              onPartTime={(value) => updateNumber("nys_part_time_count", value)}
              onStartDate={(value) => updateDate("nys_start_date", value)}
              onEndDate={(value) => updateDate("nys_end_date", value)}
            />
            <SubsidyScenarioCard
              scheme="SEF"
              contribution={draft.sef_subsidy_contribution}
              fullTime={draft.sef_full_time_count}
              partTime={draft.sef_part_time_count}
              startDate={draft.sef_start_date}
              endDate={draft.sef_end_date}
              plan={subsidyPlan.schemes.sef}
              scenarioYear={draft.year}
              onContribution={(value) => updateNumber("sef_subsidy_contribution", value)}
              onFullTime={(value) => updateNumber("sef_full_time_count", value)}
              onPartTime={(value) => updateNumber("sef_part_time_count", value)}
              onStartDate={(value) => updateDate("sef_start_date", value)}
              onEndDate={(value) => updateDate("sef_end_date", value)}
              onUseSuggestion={draft.sef_full_time_count === 0
                ? () => updateNumber("sef_full_time_count", 200)
                : undefined}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <div
              role={subsidyPlan.unmodelled_total > 0 ? "alert" : "status"}
              className={cn(
                "rounded-xl border p-4",
                subsidyPlan.unmodelled_total > 0
                  ? "border-amber-300 bg-amber-50"
                  : "border-[#1D4ED8]/20 bg-[#1D4ED8]/5",
              )}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                Total planned subsidy jobs
              </p>
              <p className="mt-1 font-serif text-3xl text-[#1D4ED8]">
                {subsidyPlan.requested_total}
              </p>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <p>Modelled <strong>{subsidyPlan.modelled_total}</strong></p>
                <p>
                  Requires future hires{" "}
                  <strong>{subsidyPlan.unmodelled_total}</strong>
                </p>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <NumberLever
                id="budget-holiday-pay"
                label="Holiday Pay"
                value={draft.holiday_pay}
                onChange={(value) => updateNumber("holiday_pay", value)}
                step={1}
                prefix="R"
              />
            </div>
            <div className="rounded-xl border bg-white p-4">
              <NumberLever
                id="budget-mentor-reserve"
                label="Mentor Reserve"
                value={draft.mentor_reserve}
                onChange={(value) => updateNumber("mentor_reserve", value)}
                step={1}
                prefix="R"
                help="Deducted from available Funding Pots before the verdict."
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#14181D]">
                Hours Matrix
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Working pattern by site type and job title.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAllDays(4)}
              >
                Set all days to 4
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAllDays(5)}
              >
                Set all days to 5
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {SITE_TYPES.map((siteType) => (
              <HoursMatrixTable
                key={siteType}
                siteType={siteType}
                rows={draft.hours_matrix[siteType] ?? {}}
                onChange={updateHours}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <p className="text-xs text-gray-500">
            {canEdit
              ? "Saving replaces the shared team scenario and refreshes every saved projection."
              : "Only Admins and Project Managers can replace the shared scenario."}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onDraftChange(cloneScenario(scenario))}
              disabled={!dirty || saving}
            >
              <RotateCcw />
              Reset to saved
            </Button>
            <Button
              type="button"
              onClick={saveScenario}
              disabled={!canEdit || !dirty || saving}
              title={
                canEdit
                  ? "Save the shared budget scenario"
                  : "Only Admins and Project Managers can save"
              }
              className="bg-[#1D4ED8] text-white hover:bg-[#1740b0]"
            >
              <Save />
              {saving ? "Saving..." : "Save scenario"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
