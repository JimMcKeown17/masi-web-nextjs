"use client";

import { useState } from "react";

import { HygienePanel } from "@/components/finance/HygienePanel";
import { ProvenanceStrip } from "@/components/finance/ProvenanceStrip";
import { useFinanceSnapshot } from "@/components/finance/useFinanceSnapshot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceFixPage() {
  const [includeOutOfScope, setIncludeOutOfScope] = useState(false);
  const { data, error, isLoading } = useFinanceSnapshot();

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Fix</h1>
          <p className="text-sm text-muted-foreground">
            Workbook findings that need review. The default view is limited to the accounting year.
          </p>
        </div>
        {data ? (
          <Button
            type="button"
            variant="outline"
            aria-pressed={includeOutOfScope}
            onClick={() => setIncludeOutOfScope((current) => !current)}
          >
            {includeOutOfScope ? `Show ${data.accounting_year} only` : "Include historical findings"}
          </Button>
        ) : null}
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
          <HygienePanel
            findings={data.snapshot.findings}
            accountingYear={data.accounting_year}
            includeOutOfScope={includeOutOfScope}
          />
        </>
      ) : null}
    </div>
  );
}
