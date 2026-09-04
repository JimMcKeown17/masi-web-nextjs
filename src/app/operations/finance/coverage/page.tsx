"use client";

import { AllocationCoverageTable } from "@/components/finance/AllocationCoverageTable";
import { ProvenanceStrip } from "@/components/finance/ProvenanceStrip";
import { useFinanceSnapshot } from "@/components/finance/useFinanceSnapshot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceCoveragePage() {
  const { data, error, isLoading } = useFinanceSnapshot();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold">Allocation coverage</h1>
        <p className="text-sm text-muted-foreground">
          Accounting-year expenditure compared with the funder allocations tagged to each project.
        </p>
      </header>

      {isLoading ? <Skeleton className="h-64 w-full rounded-xl" aria-label="Loading finance snapshot" /> : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : null}
      {data ? (
        <>
          <ProvenanceStrip response={data} />
          <AllocationCoverageTable
            coverage={data.snapshot.allocation_coverage}
            caveats={data.snapshot.allocation_coverage_caveats}
            contracts={data.snapshot.funder_contracts}
            accountingYear={data.accounting_year}
          />
        </>
      ) : null}
    </div>
  );
}
