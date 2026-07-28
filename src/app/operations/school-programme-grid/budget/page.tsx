"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/components/providers/UserProvider";
import { YearSelect } from "@/components/school-programme/shared";
import { BudgetHeadline } from "@/components/school-programme/budget/BudgetHeadline";
import { ExpenditureChart } from "@/components/school-programme/budget/ExpenditureChart";
import { LeversPanel } from "@/components/school-programme/budget/LeversPanel";
import { NotesStrip } from "@/components/school-programme/budget/NotesStrip";
import { PotsPanel } from "@/components/school-programme/budget/PotsPanel";
import { ProjectionPanels } from "@/components/school-programme/budget/ProjectionPanels";
import { QuickEstimate } from "@/components/school-programme/budget/QuickEstimate";
import { RingfencedFunders } from "@/components/school-programme/budget/RingfencedFunders";
import { useYouthBudget } from "@/components/school-programme/budget/useYouthBudget";

function BudgetPageSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading youth budget">
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
      <Skeleton className="h-[32rem] w-full rounded-xl" />
    </div>
  );
}

export default function YouthBudgetPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const user = useUser();
  const canEdit =
    user?.role === "ADMIN" || user?.role === "PROJECT MANAGER";
  const {
    data,
    error,
    isLoading,
    onScenarioUpdate,
    onPotCreate,
    onPotUpdate,
    onPotDelete,
  } = useYouthBudget(year);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-10 bg-[#1D4ED8]" />
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Community Jobs
            </span>
          </div>
          <h1 className="font-serif text-4xl leading-[1.05] text-[#14181D] md:text-5xl">
            Youth Budget{" "}
            <span className="italic font-light text-[#1D4ED8]">Calculator</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">
            Test the wage, subsidy, hiring, and working-pattern assumptions
            behind the 2026 youth staffing plan. Saved figures are shared with
            the team. Live what-if work stays in this browser.
          </p>
        </div>
        <YearSelect year={year} setYear={setYear} />
      </header>

      {isLoading ? <BudgetPageSkeleton /> : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : null}

      {data ? (
        <div className="space-y-8">
          <BudgetHeadline summary={data} />
          <NotesStrip notes={data.notes} />

          <ExpenditureChart
            expenditure={data.expenditure}
            committed={data.projections.committed}
          />

          {data.cohorts.length === 0 ? (
            <Alert>
              <AlertDescription>
                No active core youth cohorts are available for this year.
                Funding Pots and scenario controls remain visible, but the
                core committed projection is empty.
              </AlertDescription>
            </Alert>
          ) : null}

          <ProjectionPanels
            committed={data.projections.committed}
            atPlan={data.projections.at_plan}
            holidayPay={data.scenario.holiday_pay}
          />

          <PotsPanel
            pots={data.pots}
            potsTotal={data.pots_total}
            feasibility={data.feasibility}
            schoolOptions={data.school_options}
            asOf={data.as_of}
            canEdit={canEdit}
            onCreate={onPotCreate}
            onUpdate={onPotUpdate}
            onDelete={onPotDelete}
          />

          <RingfencedFunders
            pots={data.ringfenced.pots}
            totalAmount={data.ringfenced.total_amount}
          />

          <LeversPanel
            key={`${data.year}-${data.scenario.updated_at}`}
            scenario={data.scenario}
            cohorts={data.cohorts}
            savedCommitted={data.projections.committed}
            savedAtPlan={data.projections.at_plan}
            savedVerdictCommitted={data.projections.verdict_committed}
            savedVerdictAtPlan={data.projections.verdict_at_plan}
            potsTotal={data.pots_total}
            asOf={data.as_of}
            canEdit={canEdit}
            onSave={onScenarioUpdate}
          />

          <QuickEstimate
            key={`${data.year}-${data.scenario.updated_at}-${data.notes.active_total}`}
            scenario={data.scenario}
            cohorts={data.cohorts}
            remainingMonths={data.projections.committed.months.length}
            modelCommittedTotal={data.projections.committed.total}
          />
        </div>
      ) : null}
    </div>
  );
}
