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
        <h1 className="font-serif text-3xl font-semibold">Funder contracts</h1>
        <p className="text-sm text-muted-foreground">
          Review lifetime allocations, spot lines that need attention, and open each contract’s budget.
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
        </>
      ) : null}
    </div>
  );
}
