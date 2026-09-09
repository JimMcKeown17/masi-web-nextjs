import type { FinanceSnapshotResponse } from "@/lib/types/finance";

export function ProvenanceStrip({ response }: { response: FinanceSnapshotResponse }) {
  const year = response.accounting_year;
  return (
    <details className="mb-4 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
      <summary className="cursor-pointer text-foreground focus-visible:outline-2 focus-visible:outline-offset-4">
        Source details <span className="ml-2 text-xs text-muted-foreground">Workbook dated {response.workbook_date} · Accounting year {year}</span>
      </summary>
      <dl className="mt-4 grid gap-x-6 gap-y-3 break-words sm:grid-cols-2 lg:grid-cols-4">
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
    </details>
  );
}
