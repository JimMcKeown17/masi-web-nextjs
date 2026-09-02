import type { FinanceSnapshotResponse } from "@/lib/types/finance";

export function ProvenanceStrip({ response }: { response: FinanceSnapshotResponse }) {
  const year = response.accounting_year;
  return (
    <div className="mb-6 rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-foreground">Workbook</dt>
          <dd>
            {response.workbook_name}{" "}
            <span className="font-mono text-xs">{response.workbook_sha256.slice(0, 12)}</span>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Published</dt>
          <dd>{response.published_at}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Accounting year</dt>
          <dd>
            {year}: Expenditure rows where Year = {year}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Scope</dt>
          <dd>
            Contract balances are contract-lifetime; coverage is {year} only; money in funder columns
            no budget block binds is counted as owned by nobody and flagged.
          </dd>
        </div>
      </dl>
    </div>
  );
}
