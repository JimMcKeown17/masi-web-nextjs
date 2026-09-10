"use client";
import { FinanceBudgetsView } from "./FinanceBudgets";
import { runFindings } from "@/lib/types/finance-runs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceRun, FinanceRunAction, FinanceRunFinding } from "@/lib/types/finance-runs";

export function FinanceRunSummary({ run, currentId, currentRun, disabled, onAction }: {
  run: FinanceRun; currentId?: string; currentRun?: FinanceRun; disabled?: boolean; onAction: (action: FinanceRunAction) => void;
}) {
  const groups = new Map<string, FinanceRunFinding[]>();
  for (const severity of ["error", "warn", "info"]) {
    for (const inScope of [true, false]) {
      const findings = runFindings(run).filter((finding) => finding.severity === severity && finding.in_scope_year === inScope);
      if (findings.length) groups.set(`${severity} · ${inScope ? "In" : "Outside"} ${run.accounting_year}`, findings);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-3 font-serif text-2xl">Run summary <Badge variant="outline">{run.id === currentId ? "Current approved" : run.status}</Badge></CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {run.status === "failed" ? <ImportFailure run={run} currentRun={currentRun} /> : null}
        {run.status === "candidate" ? <div role="status" className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <h3 className="font-semibold">Awaiting approval</h3>
          <p className="mt-1 text-sm">Import succeeded. Review the figures and findings below, then choose Approve to make this workbook visible on the finance pages. Approval preserves all findings.</p>
        </div> : null}
        <div className="flex flex-wrap gap-3">
          {run.allowed_actions.includes("approve") && (run.status === "candidate" || run.status === "superseded") ? <Button disabled={disabled} onClick={() => onAction("approve")}>{run.status === "superseded" ? "Re-approve" : "Approve"}</Button> : null}
          {run.allowed_actions.includes("demote") && run.id === currentId && run.status === "approved" && run.previous_approved ? <Button variant="outline" disabled={disabled} onClick={() => onAction("demote")}>Demote</Button> : null}
        </div>
        <p className="break-all text-sm">Run: {run.id}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <SourceFacts title={`${run.status === "candidate" ? "Candidate" : "Selected run"} source`} run={run} />
          {currentRun ? <SourceFacts title="Current approved source" run={currentRun} /> : <p className="text-sm text-muted-foreground">Current approved source details unavailable.</p>}
        </div>
        <details><summary className="cursor-pointer text-sm font-medium">Technical details</summary>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries({ Producer: `${run.manifest.producer.name} ${run.producer_version ?? "unknown (imported)"}`, Schema: run.schema_version,
            "Parse duration": `${run.parse_duration_ms} ms`, "Total duration": `${run.total_duration_ms} ms`,
            "Peak process RSS": `${run.peak_memory_bytes} bytes`, "Ledger rows": run.status === "failed" ? "Not processed" : run.fact_row_count,
            Allocations: run.status === "failed" ? "Not processed" : run.allocation_count, Findings: run.status === "failed" ? "Not checked" : run.finding_count, "In-scope errors": run.status === "failed" ? "Not checked" : run.in_scope_error_count,
          }).map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>)}
        </dl></details>
        {run.kind === "funders" && run.schema_version === "1.0.0" ? <p>Imported snapshot: ledger facts and original producer version are unavailable.</p> : null}

        {run.kind === "budgets" && run.payload ? <FinanceBudgetsView key={run.id} payload={run.payload} manifest={run.manifest} runId={run.id}/> : null}
        <section aria-label="Findings" className="space-y-4">
          <h3 className="font-semibold">Findings</h3>
          {groups.size === 0 ? <p>{run.status === "failed" ? "Financial checks have not completed. Resolve the import problem above, then import again to review findings." : "No findings."}</p> : null}
          {[...groups].map(([label, findings]) => <div key={label} className="rounded-md border p-4">
            <h4 className="font-medium">{label} ({findings.length})</h4>
            <ul className="mt-2 space-y-3">{findings.map((finding, index) => <li key={index} className="break-words text-sm">
              <Badge variant="outline">{finding.code}</Badge> {finding.message}
              {finding.source_cells?.length ? <div>Source cells: {finding.source_cells.join(", ")}</div> : null}
              {finding.sheet_row != null ? <span> (row {finding.sheet_row})</span> : null}
              {finding.source != null ? <div className="text-muted-foreground">Source: {typeof finding.source === "string" ? finding.source : JSON.stringify(finding.source)}</div> : null}
            </li>)}</ul>
          </div>)}
        </section>

      </CardContent>
    </Card>
  );
}

function SourceFacts({ title, run }: { title: string; run: FinanceRun }) {
  return <section className="min-w-0 space-y-1 text-sm"><h3 className="font-semibold">{title}</h3>
    <p className="break-words">Name: {run.source_name}</p><p>Date: {run.source_date}</p>
    <p className="break-all">SHA-256: {run.source_sha256}</p><p>Size: {run.source_size_bytes} bytes</p>
    <p>Client modified: {run.manifest.source.client_modified_at ?? "Unavailable"}</p><p>Uploaded: {run.uploaded_at}</p>
    <p>Approved: {run.approved_at ?? "Not approved"}</p>
  </section>;
}


function ImportFailure({ run, currentRun }: { run: FinanceRun; currentRun?: FinanceRun }) {
  const hierarchy = run.failure?.code === "BUDGET_HIERARCHY_INVALID";
  const format = run.failure?.code === "WORKBOOK_NOT_CANONICAL";
  return <div role="alert" className="space-y-3 rounded-lg border border-[#C81E3C]/30 bg-[#C81E3C]/5 p-4 sm:p-5">
    <h3 className="text-lg font-semibold">{hierarchy ? "Some budget totals do not match the rows beneath them" : format ? "We could not read this workbook’s Excel structure" : "This workbook could not be imported"}</h3>
    <p className="text-sm">{hierarchy
      ? "A subtotal must include each of its immediate child rows exactly once. The import also checks that every budget line belongs to a department and section. Processing stopped because these checks did not pass."
      : format ? "The importer encountered an Excel structure it could not safely interpret. This can be a compatibility problem with the importer; it does not mean your financial entries are wrong."
      : "Processing stopped before the financial checks could finish. This import cannot be approved."}</p>
    {hierarchy && run.failure?.diagnostics?.length ? <div className="overflow-x-auto">
      <table className="w-full text-left text-sm"><caption className="mb-2 text-left font-semibold">Subtotal cells to check (up to 20 per import)</caption>
        <thead><tr><th className="py-2 pr-4">Location</th><th className="py-2">Rows the subtotal must include</th></tr></thead>
        <tbody>{run.failure.diagnostics.map((item) => <tr key={`${item.sheet}!${item.cell}`} className="border-t border-[#C81E3C]/15">
          <th scope="row" className="py-2 pr-4 align-top font-medium">{item.sheet}!{item.cell}</th>
          <td className="max-w-lg break-words py-2">{item.expected_cells.length ? item.expected_cells.join(", ") : "All immediate child rows, once each"}</td>
        </tr>)}</tbody>
      </table>
    </div> : null}
    <p className="text-sm"><strong>Next step: </strong>{hierarchy
      ? "Check the subtotal formulas and the Cat hierarchy in your budget sheet. Correct the source, then refresh from Google Sheets or upload the updated file."
      : format ? "Keep this file for investigation. Share the error reference below with the site maintainer so the unsupported structure can be identified before changing your accounts."
      : "Check that you selected the right workbook type and year. If those are correct, share the error reference below with the site maintainer."}</p>
    <p className="text-sm font-medium">{currentRun ? `Your finance pages still use the approved source: ${currentRun.source_name}. This failed import has not replaced it.` : "This failed import has not published any new figures."}</p>
    <details className="text-sm"><summary className="cursor-pointer">Error reference</summary>
      <p className="mt-2 break-all">{run.failure?.code ?? "IMPORT_FAILED"} · Run {run.id}</p>
      <p>Processing stage: {run.failure?.phase ?? "unknown"}</p>
    </details>
  </div>;
}
