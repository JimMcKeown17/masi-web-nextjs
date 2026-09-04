import { Badge } from "@/components/ui/badge";
import type { FinanceSnapshotResponse } from "@/lib/types/finance";

import { ProvenanceStrip } from "./ProvenanceStrip";

export function FinanceOverviewStatus({ response }: { response: FinanceSnapshotResponse }) {
  const snapshot = response.snapshot;
  const currentFindings = snapshot.findings.filter((finding) => finding.in_scope_year);
  const currentErrors = currentFindings.filter((finding) => finding.severity === "error");

  return (
    <>
      <ProvenanceStrip response={response} />
      <section aria-labelledby="finance-status-heading" className="rounded-md border p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="finance-status-heading" className="text-lg font-semibold">
              Published funder snapshot
            </h2>
            <p className="text-sm text-muted-foreground">
              Status and exceptions only. Financial performance stays in its domain views.
            </p>
          </div>
          <Badge variant={currentErrors.length > 0 ? "destructive" : "outline"}>
            {currentErrors.length > 0
              ? `${currentErrors.length} errors need attention`
              : "No current-year errors"}
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatusCount label="current-year findings" value={currentFindings.length} />
          <StatusCount label="funder contracts" value={snapshot.funder_contracts.length} />
          <StatusCount label="coverage groups" value={snapshot.allocation_coverage.length} />
        </div>
      </section>
    </>
  );
}

function StatusCount({ label, value }: { label: string; value: number }) {
  return (
    <p className="rounded-md bg-muted/40 px-4 py-3 text-sm">
      <span className="font-serif text-2xl tabular-nums">{value}</span> {label}
    </p>
  );
}
