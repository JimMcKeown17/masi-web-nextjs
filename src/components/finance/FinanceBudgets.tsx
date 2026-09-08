"use client";
import type { FinanceCurrent, FinanceRunManifest } from "@/lib/types/finance-runs";
import { BudgetContributors } from "./BudgetContributors";
import { FinanceExportButtons } from "./FinanceExportButtons";
import { ChevronDown, ChevronRight } from "lucide-react";
import { financeCurrentMessage } from "@/lib/finance/currentMessage";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRand } from "@/lib/finance/money";
import type { BudgetHierarchy, BudgetLine, BudgetMetric, BudgetNode, BudgetPayload } from "@/lib/types/finance-budgets";

const METRICS: [BudgetMetric, string][] = [["budget","Budget"],["actual","Actual"],["projected","Projected"],["variance_all","All Funds variance"],["variance_masi","Masi variance"]];
const COMPLETENESS_LABELS: Record<string, string> = {
  budget_unavailable: "Budget unavailable", actual_unavailable: "Actual unavailable",
  wf_excluded: "Excluded by WF", budget_incomplete: "Budget incomplete",
  actual_incomplete: "Actual incomplete", projected_incomplete: "Projected amount incomplete",
  variance_all_incomplete: "All Funds variance incomplete", variance_masi_incomplete: "Masi variance incomplete",
};
function valueLabel(row: BudgetNode, metric: BudgetMetric) {
  const fallback = "known_subtotals" in row ? "unavailable (incomplete)" : metric === "budget" ? "budget not set" : metric === "actual" ? "actual unavailable" : metric === "variance_masi" && row.completeness_reasons.includes("wf_excluded") ? "excluded by WF" : "unavailable";
  return formatRand(row[metric],fallback);
}
export function FinanceBudgetsView({payload, manifest, runId, compatibility}: {payload: BudgetPayload; manifest: FinanceRunManifest; runId: string; compatibility?: FinanceCurrent}) {
  const [selectedLine,setSelectedLine] = useState<BudgetLine>();
  const [filter,setFilter] = useState("");
  const [collapsed,setCollapsed] = useState<Set<string>>(new Set());
  const {hierarchy,lines,projection} = payload;
  const visible: (BudgetHierarchy | BudgetLine)[] = [];
  function visit(parent: string | null) {
    for (const row of [...hierarchy.filter(n=>n.parent_id===parent),...lines.filter(n=>n.parent_id===parent)].sort((a,b)=>a.sheet_row-b.sheet_row)) {
      if (!filter || row.label.toLowerCase().includes(filter.toLowerCase()) || ("line_ids" in row && row.line_ids.some(id=>lines.some(line=>line.id===id && line.label.toLowerCase().includes(filter.toLowerCase()))))) visible.push(row);
      if ("level" in row && (filter || !collapsed.has(row.id))) visit(row.id);
    }
  }
  visit(null);
  function basis(row: BudgetHierarchy | BudgetLine) {
    return ("calc" in row ? `${row.calc?.toLowerCase()==="b" ? "budget used" : "linear projection"}. BC: ${row.bc ?? "unbound"}. Applied share: ${row.actual_share}. Contributors: ${row.ledger_row_count}. ${payload.lines_by_bc.some(group=>group.line_ids.includes(row.id)&&group.line_ids.length>1) ? "Shared BC. " : ""}` : "") + (row.complete ? "Complete" : row.completeness_reasons.map(reason=>COMPLETENESS_LABELS[reason] ?? reason).join(", "));
  }
  function displayValue(row: BudgetHierarchy | BudgetLine,key:BudgetMetric) {return valueLabel(row,key)+("known_subtotals" in row && row[key]===null ? `; Known subtotal: ${formatRand(row.known_subtotals[key])}` : "");}
  const exportRows=[["Department / Sub-department / Line",...METRICS.map(([,label])=>label),"Basis and completeness"],...visible.map(row=>[row.label,...METRICS.map(([key])=>displayValue(row,key)),basis(row)])];
  return <section className="space-y-4" aria-label="Budget hierarchy">
    <h1 className="font-serif text-3xl">Budgets</h1>
    <p>Sheet as-of: {projection.sheet_as_of}. Month: {projection.month_count}. {payload.summary.complete ? "Complete" : "Incomplete"}.</p>
    {compatibility && !compatibility.compatible ? <p role="status">{financeCurrentMessage(compatibility)}</p> : null}
    {manifest.dependencies.map((dependency,index)=><div className="break-all text-sm" key={index}><p>Pinned ledger: {dependency.run_id}</p><p>{dependency.source_name} · {dependency.source_date}</p><p>Management Accounts SHA-256: {dependency.source_sha256}</p></div>)}
    <p>Budget source: {manifest.source.name} · {manifest.source.date}</p>
    <p className="break-all">Budget source SHA-256: {manifest.source.sha256}</p>
    <p className="break-all">Budget run: {runId}</p>
    <p>Full ledger amounts before budget share. Shared BC contributors are shown in full; the explicit applied share belongs to each budget line.</p>
    <input aria-label="Filter budget rows" className="rounded border bg-background p-2" placeholder="Filter by label" value={filter} onChange={event=>setFilter(event.target.value)}/>
    <FinanceExportButtons rows={exportRows} name={`budgets-${runId}`}/>
    <Table><TableHeader><TableRow><TableHead>Department / Sub-department / Line</TableHead>{METRICS.map(([key,label])=><TableHead key={key}>{label}</TableHead>)}<TableHead>Basis and completeness</TableHead></TableRow></TableHeader>
      <TableBody>{visible.map(row=><TableRow key={row.id} className={"level" in row ? "bg-muted/40 font-medium" : undefined}>
        <TableCell className={"level" in row ? row.level === 1 ? "pl-2" : "pl-6" : "pl-12"}>{"level" in row ? <Button variant="ghost" aria-expanded={!collapsed.has(row.id)} onClick={()=>setCollapsed(previous=>{const next=new Set(previous);if(next.has(row.id))next.delete(row.id);else next.add(row.id);return next;})}>{collapsed.has(row.id) ? <ChevronRight aria-hidden="true" className="size-4 shrink-0"/> : <ChevronDown aria-hidden="true" className="size-4 shrink-0"/>}{row.label}</Button> : row.label}</TableCell>
        {METRICS.map(([key])=><TableCell className="tabular-nums whitespace-normal min-w-28 max-w-44" key={key}>{displayValue(row,key)}</TableCell>)}
        <TableCell className="whitespace-normal min-w-52 max-w-64">{basis(row)}{"bc" in row && row.bc !== null ? <Button variant="outline" onClick={()=>setSelectedLine(row)}>View contributors for {row.label}</Button> : null}</TableCell>
      </TableRow>)}</TableBody>
    </Table>
    {selectedLine ? <BudgetContributors key={`${runId}:${selectedLine.id}`} line={selectedLine} runId={runId} year={manifest.accounting_year}/> : null}
  </section>;
}
