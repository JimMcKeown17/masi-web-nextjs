"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/components/providers/UserProvider";
import { YearSelect } from "@/components/school-programme/shared";
import { BudgetWorkspace } from "@/components/school-programme/budget/BudgetWorkspace";
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
            the team. Live what-if work remains unsaved until an authorised
            user chooses to share it.
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
        <BudgetWorkspace
          key={`${data.year}-${data.scenario.updated_at}`}
          summary={data}
          canEdit={canEdit}
          onScenarioUpdate={onScenarioUpdate}
          onPotCreate={onPotCreate}
          onPotUpdate={onPotUpdate}
          onPotDelete={onPotDelete}
        />
      ) : null}
    </div>
  );
}
