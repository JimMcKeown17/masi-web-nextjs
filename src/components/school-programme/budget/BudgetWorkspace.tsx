"use client";

import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  BudgetScenarioUpdate,
  FundingPotCreate,
  FundingPotUpdate,
  YouthBudgetPreview,
  YouthBudgetSummary,
} from "@/lib/types/youth-budget";
import { BudgetHeadline } from "./BudgetHeadline";
import { ExpenditureChart } from "./ExpenditureChart";
import { LeversPanel } from "./LeversPanel";
import { NotesStrip } from "./NotesStrip";
import { PotsPanel } from "./PotsPanel";
import { ProgrammeEndDateControl } from "./ProgrammeEndDateControl";
import { ProjectionPanels } from "./ProjectionPanels";
import { QuickEstimate } from "./QuickEstimate";
import { RingfencedFunders } from "./RingfencedFunders";
import {
  cloneScenario,
  editableScenarioFields,
} from "./projection";
import { useYouthBudgetPreview } from "./useYouthBudget";

interface BudgetWorkspaceProps {
  summary: YouthBudgetSummary;
  canEdit: boolean;
  onScenarioUpdate: (
    fields: Omit<BudgetScenarioUpdate, "year">,
  ) => Promise<void>;
  onPotCreate: (fields: Omit<FundingPotCreate, "year">) => Promise<void>;
  onPotUpdate: (potId: number, fields: FundingPotUpdate) => Promise<void>;
  onPotDelete: (potId: number) => Promise<void>;
}

function savedCalculation(summary: YouthBudgetSummary): YouthBudgetPreview {
  return {
    projections: summary.projections,
    ringfenced_projections: summary.ringfenced.projections,
    ringfenced_pots: summary.ringfenced.pots,
    spend_forecast: summary.spend_forecast,
    feasibility: summary.feasibility,
  };
}

export function BudgetWorkspace({
  summary,
  canEdit,
  onScenarioUpdate,
  onPotCreate,
  onPotUpdate,
  onPotDelete,
}: BudgetWorkspaceProps) {
  const [draft, setDraft] = useState(() => cloneScenario(summary.scenario));
  const savedFields = useMemo(
    () => JSON.stringify(editableScenarioFields(summary.scenario)),
    [summary.scenario],
  );
  const draftFields = useMemo(
    () => JSON.stringify(editableScenarioFields(draft)),
    [draft],
  );
  const dirty = draftFields !== savedFields;
  const previewRequest = useMemo(
    () =>
      dirty
        ? {
            year: summary.year,
            ...editableScenarioFields(draft),
          }
        : null,
    [dirty, draft, summary.year],
  );
  const preview = useYouthBudgetPreview(previewRequest);
  const calculation = dirty && preview.data
    ? preview.data
    : savedCalculation(summary);
  const liveSummary = useMemo<YouthBudgetSummary>(
    () => ({
      ...summary,
      scenario: draft,
      projections: calculation.projections,
      spend_forecast: calculation.spend_forecast,
      feasibility: calculation.feasibility,
      ringfenced: {
        ...summary.ringfenced,
        pots: calculation.ringfenced_pots,
        projections: calculation.ringfenced_projections,
      },
    }),
    [calculation, draft, summary],
  );

  return (
    <div className="space-y-8">
      <BudgetHeadline
        summary={liveSummary}
        live={dirty}
        recalculating={dirty && preview.isValidating}
      />
      <NotesStrip notes={summary.notes} />

      <ProgrammeEndDateControl
        draft={draft}
        asOf={summary.as_of}
        recalculating={dirty && preview.isValidating}
        onChange={setDraft}
      />

      {dirty && preview.error ? (
        <Alert variant="destructive">
          <AlertDescription>
            Preview failed: {preview.error instanceof Error
              ? preview.error.message
              : "Unknown preview error"}. The figures below remain on the most
            recent successful calculation.
          </AlertDescription>
        </Alert>
      ) : null}

      <ExpenditureChart
        expenditure={summary.expenditure}
        forecast={calculation.spend_forecast}
        live={dirty}
      />

      {summary.cohorts.length === 0 ? (
        <Alert>
          <AlertDescription>
            No active core youth cohorts are available for this year. Funding
            Pots and scenario controls remain visible, but the core committed
            projection is empty.
          </AlertDescription>
        </Alert>
      ) : null}

      <ProjectionPanels
        committed={calculation.projections.committed}
        atPlan={calculation.projections.at_plan}
        holidayPay={draft.holiday_pay}
        lastPaidProgrammeDate={draft.last_paid_programme_date}
        live={dirty}
      />

      <PotsPanel
        pots={summary.pots}
        potsTotal={summary.pots_total}
        feasibility={calculation.feasibility}
        schoolOptions={summary.school_options}
        asOf={summary.as_of}
        canEdit={canEdit}
        onCreate={onPotCreate}
        onUpdate={onPotUpdate}
        onDelete={onPotDelete}
      />

      <RingfencedFunders
        pots={calculation.ringfenced_pots}
        totalAmount={summary.ringfenced.total_amount}
      />

      <LeversPanel
        scenario={summary.scenario}
        draft={draft}
        savedCommitted={summary.projections.committed}
        savedAtPlan={summary.projections.at_plan}
        savedVerdictCommitted={summary.projections.verdict_committed}
        savedVerdictAtPlan={summary.projections.verdict_at_plan}
        liveCommitted={calculation.projections.committed}
        liveAtPlan={calculation.projections.at_plan}
        liveVerdictCommitted={calculation.projections.verdict_committed}
        liveVerdictAtPlan={calculation.projections.verdict_at_plan}
        asOf={summary.as_of}
        canEdit={canEdit}
        dirty={dirty}
        previewing={dirty && preview.isValidating}
        onDraftChange={setDraft}
        onSave={onScenarioUpdate}
      />

      <QuickEstimate
        scenario={summary.scenario}
        cohorts={summary.cohorts}
        remainingMonths={summary.projections.committed.months.length}
        modelCommittedTotal={summary.projections.committed.total}
      />
    </div>
  );
}
