"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { FinanceBudgets } from "@/components/finance/FinanceBudgetsPage";
import { FinanceOverviewStatus } from "@/components/finance/FinanceOverviewStatus";
import { useFinanceSnapshot } from "@/components/finance/useFinanceSnapshot";

export default function FinanceOverviewPage() {
  const { data, error, isLoading } = useFinanceSnapshot();

  return (
    <div>
      <header className="mb-4">
        <h1 className="font-serif text-3xl font-semibold">Finance overview</h1>
        <p className="text-sm text-muted-foreground">
          Projected spending first. Follow each variance to its source expenses.
        </p>
      </header>

      <FinanceBudgets presentation="overview" />

      <details className="mt-6 rounded-xl border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Latest funder publication status and exceptions
        </summary>
        <div className="mt-4">
          {isLoading ? (
            <Skeleton
              className="h-64 w-full rounded-xl"
              aria-label="Loading finance snapshot"
            />
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          ) : null}
          {data ? <FinanceOverviewStatus response={data} /> : null}
        </div>
      </details>
    </div>
  );
}
