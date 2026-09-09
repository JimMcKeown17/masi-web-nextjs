"use client";

import { useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPercent, formatRand } from "@/lib/finance/money";
import type { FinanceLine, FunderContract, Money } from "@/lib/types/finance";

import { CompletenessBadges } from "./badges";

const BUDGET_NOT_SET = "budget not set";

export function contractHref(contractCode: string): string {
  return `/operations/finance/funders/${encodeURIComponent(contractCode)}`;
}

// The snapshot validates decimal strings with two places. Compare exact cents;
// financial totals and remaining balances continue to come from the backend.
function cents(value: Money): bigint {
  return BigInt(value.replace(".", ""));
}

function lineAnchor(contract: FunderContract, line: FinanceLine): string {
  return `contract-${encodeURIComponent(contract.id)}-line-${encodeURIComponent(line.line_id)}`;
}

function lineAttention(line: FinanceLine): string | null {
  if (line.budget === null) return "Budget not set";
  const allocated = line.binding === "derived" ? line.allocated_lifetime : line.allocated_asserted;
  if (allocated !== null && cents(allocated) > cents(line.budget)) {
    return line.binding === "derived" ? "Allocated above budget" : "Typed allocation above budget";
  }
  if (line.binding === "derived" && cents(line.budget) > BigInt(0) && line.row_count === 0) {
    return "No recorded allocation rows";
  }
  return null;
}

interface Props {
  contracts: FunderContract[];
  accountingYear: number;
  initiallyExpanded?: string[];
}

export function FunderContractsTable({ contracts, accountingYear, initiallyExpanded = [] }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initiallyExpanded));
  const attention = contracts.flatMap((contract) => contract.lines.flatMap((line) => {
    const reason = lineAttention(line);
    return reason ? [{ contract, line, reason }] : [];
  }));

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function revealLine(contract: FunderContract, line: FinanceLine) {
    setExpanded((current) => new Set(current).add(contract.id));
    requestAnimationFrame(() => document.getElementById(lineAnchor(contract, line))?.focus());
  }

  if (contracts.length === 0) {
    return <p className="rounded-xl border bg-card p-6 text-muted-foreground">No funder contracts in this snapshot.</p>;
  }

  return (
    <div className="mb-10 space-y-6">
      <section aria-label="Funder attention" className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="font-serif text-2xl">Needs a closer look</h2>
            <p className="mt-1 text-sm text-muted-foreground">Review the lines behind the contract balance.</p>
          </div>
          <Badge variant="outline">{attention.length} {attention.length === 1 ? "line to review" : "lines to review"}</Badge>
        </div>
        {attention.length > 0 ? (
          <ul className="max-h-80 divide-y overflow-y-auto">
            {attention.map(({ contract, line, reason }) => (
              <li key={`${contract.id}:${line.line_id}`} className="px-5 py-3">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-start justify-between gap-2 rounded text-left outline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
                  onClick={() => revealLine(contract, line)}
                >
                  <span>
                    <span className="block font-medium">{line.category ?? "Uncategorised line"}</span>
                    <span className="text-sm text-muted-foreground">{contract.contract_code ?? contract.block_label} · Workbook row {line.sheet_row}</span>
                  </span>
                  <span className="text-sm font-medium text-[#C81E3C] dark:text-[#E72D4D]">{reason} <span aria-hidden="true">↗</span></span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="px-5 py-4 text-sm text-muted-foreground">No above-budget, missing-budget, or empty allocation lines found in this snapshot.</p>}
        <p className="border-t px-5 py-3 text-xs leading-relaxed text-muted-foreground">
          Lifetime allocations reflect what is recorded in the workbook. An empty allocation line is a prompt to check the plan, not evidence of overdue spending. Typed figures are identified separately.
        </p>
      </section>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        {contracts.map((contract) => {
          const open = expanded.has(contract.id);
          const percent = formatPercent(contract.allocated_total_lifetime, contract.budget_total);
          const href = contract.contract_code ? contractHref(contract.contract_code) : undefined;
          const over = contract.remaining !== null && cents(contract.remaining) < BigInt(0);
          const panelId = `contract-lines-${encodeURIComponent(contract.id)}`;
          return (
            <article key={contract.id} data-contract-href={href} className={`min-w-0 overflow-hidden rounded-xl border bg-card ${open ? "lg:col-span-2" : ""}`}>
              <div className={`border-t-4 p-5 ${over ? "border-t-[#C81E3C]" : "border-t-[#1D4ED8]"}`}>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words font-serif text-2xl">
                      {href ? <Link data-contract-link href={href} className="underline-offset-4 hover:underline">{contract.contract_code}</Link> : contract.block_label}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {contract.contract_code ? `${contract.block_label} · ` : ""}
                      {contract.period_label ?? `row ${contract.sheet_row}`}
                      {contract.in_scope_year ? null : ` (no ${accountingYear} rows)`}
                    </p>
                  </div>
                  {over ? <Badge className="bg-[#C81E3C] text-white">Allocated above budget</Badge> : null}
                </div>
                <dl className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-3">
                  <Amount label="Budget" value={formatRand(contract.budget_total, BUDGET_NOT_SET)} />
                  <Amount label="Allocated (lifetime)" value={formatRand(contract.allocated_total_lifetime)} />
                  <Amount label="Remaining" value={formatRand(contract.remaining, BUDGET_NOT_SET)} critical={over} />
                </dl>
                <div className="mt-5 flex flex-wrap justify-between gap-x-4 gap-y-2 border-t pt-4 text-sm">
                  <span><span className="text-muted-foreground">% used: </span><span className="tabular-nums">{percent ?? (contract.budget_total === null ? BUDGET_NOT_SET : "not available")}</span></span>
                  <span><span className="text-muted-foreground">Allocated ({accountingYear} only)</span>: <span className="tabular-nums">{formatRand(contract.allocated_total_in_year)}</span></span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {contract.complete ? <Badge variant="outline">Complete data</Badge> : <CompletenessBadges reasons={contract.completeness_reasons} />}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" size="sm" aria-expanded={open} aria-controls={panelId} aria-label={`${open ? "Collapse" : "Expand"} ${contract.block_label}`} onClick={() => toggle(contract.id)}>
                    {open ? "Hide budget lines" : "Review budget lines"} <span aria-hidden="true">{open ? "−" : "+"}</span>
                  </Button>
                  {href ? <Link href={href} className="text-sm font-medium text-[#1D4ED8] underline-offset-4 hover:underline dark:text-blue-400">Open contract <span aria-hidden="true">↗</span></Link> : null}
                </div>
              </div>
              {open ? <div id={panelId} className="border-t bg-muted/20 p-4"><LinesTable contract={contract} accountingYear={accountingYear} /></div> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Amount({ label, value, critical = false }: { label: string; value: string; critical?: boolean }) {
  return <div className="min-w-0"><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className={`mt-1 break-words font-serif text-2xl tabular-nums ${critical ? "text-[#C81E3C] dark:text-[#E72D4D]" : ""}`}>{value}</dd></div>;
}

function LinesTable({ contract, accountingYear }: { contract: FunderContract; accountingYear: number }) {
  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">Budget lines retain their workbook bindings. Derived figures come from matched ledger rows; asserted figures are typed in the sheet.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category / source</TableHead>
            <TableHead className="text-right">Budget</TableHead>
            <TableHead className="text-right">Allocated (lifetime)</TableHead>
            <TableHead className="text-right">Allocated ({accountingYear} only)</TableHead>
            <TableHead>Binding / keys</TableHead>
            <TableHead>Review</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contract.lines.map((line) => (
            <TableRow key={line.line_id} id={lineAnchor(contract, line)} tabIndex={-1} className="focus-visible:outline-2 focus-visible:outline-[#1D4ED8]">
              <TableCell className="whitespace-normal">
                <span className="font-medium">{line.category ?? "(no category)"}</span>
                <span className="mt-1 block text-xs text-muted-foreground">Workbook row {line.sheet_row}</span>
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatRand(line.budget, BUDGET_NOT_SET)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {line.binding === "derived" ? formatRand(line.allocated_lifetime) : formatRand(line.allocated_asserted, "no value")}
                {line.binding === "asserted" ? <span className="block text-xs text-muted-foreground">typed in the sheet</span> : null}
              </TableCell>
              <TableCell className="text-right tabular-nums">{line.binding === "derived" ? formatRand(line.allocated_in_year) : "n/a"}</TableCell>
              <TableCell className="whitespace-normal">
                <Badge variant={line.binding === "derived" ? "outline" : "secondary"}>{line.binding}</Badge>
                <span className="mt-1 block text-xs text-muted-foreground">{line.key_column ? `${line.key_column} = ${line.key_values.join(", ")}` : "typed in the sheet"}</span>
              </TableCell>
              <TableCell className="whitespace-normal text-sm text-[#C81E3C] dark:text-[#E72D4D]">{lineAttention(line) ?? ""}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-3 text-xs text-muted-foreground">For individual expenses, use the workbook row and binding above. Expense drilldown for this exact contract line is not available yet.</p>
    </>
  );
}
