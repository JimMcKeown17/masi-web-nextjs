"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { FinanceOverviewStatus } from "@/components/finance/FinanceOverviewStatus";
import { useFinanceSnapshot } from "@/components/finance/useFinanceSnapshot";

export default function FinanceOverviewPage() {
  const { data, error, isLoading } = useFinanceSnapshot();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold">Finance overview</h1>
        <p className="text-sm text-muted-foreground">
          Publication status and current exceptions. Domain dashboards hold the financial detail.
        </p>
      </header>

      {isLoading ? <Skeleton className="h-64 w-full rounded-xl" aria-label="Loading finance snapshot" /> : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : null}
      {data ? <FinanceOverviewStatus response={data} /> : null}
    </div>
  );
}
