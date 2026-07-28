"use client";

import { useMemo, useState } from "react";
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
  YouthBudgetCohort,
  YouthBudgetSiteType,
} from "@/lib/types/youth-budget";
import {
  calculateCommittedWhatIf,
  cloneScenario,
  editableScenarioFields,
} from "./projection";
import {
  formatBudgetDate,
  formatMonth,
  formatRand,
  verdictLanguage,
} from "./format";

const MONTH_OPTIONS = [7, 8, 9, 10, 11];
const SITE_TYPES: YouthBudgetSiteType[] = ["primary", "ecd"];

type NumberField =
  | "wage_rate"
  | "subsidy_contribution"
  | "nys_conversion_count"
  | "nys_subsidy_only_count"
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
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={prefix ? "pl-8 tabular-nums" : "tabular-nums"}
        />
      </div>
      {help ? <p className="text-[11px] leading-relaxed text-gray-500">{help}</p> : null}
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
  cohorts,
  savedCommitted,
  savedAtPlan,
  savedVerdictCommitted,
  savedVerdictAtPlan,
  potsTotal,
  asOf,
  canEdit,
  onSave,
}: {
  scenario: BudgetScenario;
  cohorts: YouthBudgetCohort[];
  savedCommitted: BudgetProjection;
  savedAtPlan: BudgetProjection;
  savedVerdictCommitted: number;
  savedVerdictAtPlan: number;
  potsTotal: number;
  asOf: string;
  canEdit: boolean;
  onSave: (fields: Omit<BudgetScenarioUpdate, "year">) => Promise<void>;
}) {
  const [draft, setDraft] = useState(() => cloneScenario(scenario));
  const [saving, setSaving] = useState(false);

  const whatIf = useMemo(
    () =>
      calculateCommittedWhatIf(
        draft,
        cohorts,
        savedCommitted.months,
      ),
    [draft, cohorts, savedCommitted.months],
  );
  const whatIfVerdict = potsTotal - draft.mentor_reserve - whatIf.total;
  const dirty =
    JSON.stringify(editableScenarioFields(draft)) !==
    JSON.stringify(editableScenarioFields(scenario));

  function updateNumber(field: NumberField, value: number) {
    const normalized =
      field === "nys_conversion_count" ||
      field === "nys_subsidy_only_count" ||
      field === "utilisation_pct"
        ? Math.trunc(value)
        : value;
    setDraft((current) => ({
      ...current,
      [field]: Number.isFinite(normalized) ? Math.max(0, normalized) : 0,
    }));
  }

  function updateMonth(
    field: "nys_conversion_start_month" | "vacancy_start_month",
    value: number,
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateHours(
    siteType: YouthBudgetSiteType,
    title: string,
    field: keyof HoursMatrixEntry,
    value: number,
  ) {
    setDraft((current) => ({
      ...current,
      hours_matrix: {
        ...current.hours_matrix,
        [siteType]: {
          ...current.hours_matrix[siteType],
          [title]: {
            ...current.hours_matrix[siteType][title],
            [field]: Number.isFinite(value) ? Math.max(0, value) : 0,
          },
        },
      },
    }));
  }

  function setAllDays(value: 4 | 5) {
    setDraft((current) => ({
      ...current,
      hours_matrix: {
        primary: Object.fromEntries(
          Object.entries(current.hours_matrix.primary).map(([title, entry]) => [
            title,
            { ...entry, days_per_week: value },
          ]),
        ),
        ecd: Object.fromEntries(
          Object.entries(current.hours_matrix.ecd).map(([title, entry]) => [
            title,
            { ...entry, days_per_week: value },
          ]),
        ),
      },
    }));
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
              Every control recalculates the currently employed cost in this browser. Nothing
              is shared with the team until an authorised user saves.
            </p>
          </div>
          <div className="text-right text-xs text-white/60">
            <p>Saved by {scenario.updated_by || "the system"}</p>
            <p>{formatBudgetDate(scenario.updated_at.slice(0, 10))}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <VerdictTile
            eyebrow="Saved verdict, currently employed"
            verdict={savedVerdictCommitted}
            cost={savedCommitted.total}
          />
          <VerdictTile
            eyebrow={dirty ? "Live what-if verdict" : "Live what-if matches saved"}
            verdict={whatIfVerdict}
            cost={whatIf.total}
            live
          />
        </div>

        <div className="rounded-lg border border-dashed border-[#1D4ED8]/30 bg-[#1D4ED8]/5 px-4 py-3 text-sm text-gray-700">
          <strong className="text-[#14181D]">Saved at plan:</strong>{" "}
          {verdictLanguage(savedVerdictAtPlan).phrase} at{" "}
          {formatRand(savedAtPlan.total)}. Live what-if covers currently
          employed youth only because vacancy cohort rows are not in this
          payload. Save to recompute at-plan.
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#14181D]">
            Organisation levers
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            The calculation uses {formatBudgetDate(asOf)} as its start date and
            the school-day counts supplied by the backend.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberLever
              id="budget-wage-rate"
              label="Wage Rate per hour"
              value={draft.wage_rate}
              onChange={(value) => updateNumber("wage_rate", value)}
              step={0.01}
              prefix="R"
            />
            <NumberLever
              id="budget-subsidy"
              label="Subsidy Contribution"
              value={draft.subsidy_contribution}
              onChange={(value) => updateNumber("subsidy_contribution", value)}
              step={1}
              prefix="R"
            />
            <NumberLever
              id="budget-utilisation"
              label="Utilisation %"
              value={draft.utilisation_pct}
              onChange={(value) => updateNumber("utilisation_pct", value)}
              step={1}
              help="Average share of full-cap hours actually worked. 100 is the conservative full-attendance assumption; calibrate from post-SEF ledger months."
            />
            <NumberLever
              id="budget-nys-count"
              label="NYS Conversion count"
              value={draft.nys_conversion_count}
              onChange={(value) => updateNumber("nys_conversion_count", value)}
              step={1}
            />
            <NumberLever
              id="budget-nys-subsidy-only"
              label="Of which subsidy-only (cost R0)"
              value={draft.nys_subsidy_only_count}
              onChange={(value) =>
                updateNumber("nys_subsidy_only_count", value)
              }
              step={1}
              help="Part-timers who earn only their SEF/NYS funding and never touch Masi payroll."
            />
            <MonthLever
              id="budget-nys-start"
              label="NYS Conversion start"
              value={draft.nys_conversion_start_month}
              onChange={(value) =>
                updateMonth("nys_conversion_start_month", value)
              }
            />
            <MonthLever
              id="budget-vacancy-start"
              label="Vacancy Start Month"
              value={draft.vacancy_start_month}
              onChange={(value) => updateMonth("vacancy_start_month", value)}
              help="This changes saved at-plan only. Save to ask the backend to recompute it."
            />
            <NumberLever
              id="budget-holiday-pay"
              label="Holiday Pay"
              value={draft.holiday_pay}
              onChange={(value) => updateNumber("holiday_pay", value)}
              step={1}
              prefix="R"
            />
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
              onClick={() => setDraft(cloneScenario(scenario))}
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
