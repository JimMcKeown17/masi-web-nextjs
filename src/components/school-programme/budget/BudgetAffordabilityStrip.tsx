"use client";

import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRand } from "./format";
import { useYouthBudget } from "./useYouthBudget";

export function BudgetAffordabilityStrip({ year }: { year: number }) {
  const { data, error, isLoading } = useYouthBudget(year);

  if (isLoading) {
    return <Skeleton className="mb-4 h-11 w-full rounded-lg" />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4 py-2">
        <AlertDescription className="text-xs">
          Budget status is unavailable. Youth staffing remains available.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const verdict = data.projections.verdict_at_plan;
  const status =
    Math.abs(verdict) < 0.005
      ? "matches available funding"
      : `${formatRand(Math.abs(verdict))} ${
          verdict < 0 ? "over" : "under"
        } available funding`;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1D4ED8]/20 bg-[#1D4ED8]/5 px-4 py-2.5 text-sm">
      <p>
        <span className="font-medium text-[#14181D]">At plan:</span>{" "}
        <span className="text-gray-600">{status}</span>
      </p>
      <Link
        href="/operations/school-programme-grid/budget"
        className="font-medium text-[#14181D] underline decoration-2 decoration-[#1D4ED8] underline-offset-4 hover:text-[#1D4ED8]"
      >
        View Budget
      </Link>
    </div>
  );
}
