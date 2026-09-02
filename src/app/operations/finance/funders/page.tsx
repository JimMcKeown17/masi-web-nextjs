"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { FunderContractsTable } from "@/components/finance/FunderContractsTable";
import { ProvenanceStrip } from "@/components/finance/ProvenanceStrip";
import { useFinanceSnapshot } from "@/components/finance/useFinanceSnapshot";

export default function FundersPage() {
  const { data, error, isLoading } = useFinanceSnapshot();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Funder contracts</h1>
        <p className="text-sm text-muted-foreground">
          Budget, allocated and remaining per funder contract, recomputed from the management workbook.
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
          <FunderContractsTable contracts={data.snapshot.funder_contracts} accountingYear={data.accounting_year} />
          {/* AllocationCoverageTable, HygienePanel: Tasks 5-6 */}
        </>
      ) : null}
    </div>
  );
}
