"use client";

import { Fragment, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPercent, formatRand } from "@/lib/finance/money";
import type { FinanceLine, FunderContract } from "@/lib/types/finance";

import { CompletenessBadges } from "./badges";

const BUDGET_NOT_SET = "budget not set";

interface Props {
  contracts: FunderContract[];
  accountingYear: number;
  initiallyExpanded?: string[];
}

export function FunderContractsTable({ contracts, accountingYear, initiallyExpanded = [] }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initiallyExpanded));

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mb-10 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Funder contract</TableHead>
            <TableHead className="text-right">Budget</TableHead>
            <TableHead className="text-right">Allocated (lifetime)</TableHead>
            <TableHead className="text-right">Remaining</TableHead>
            <TableHead className="text-right">% used</TableHead>
            <TableHead className="text-right">Allocated ({accountingYear} only)</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => {
            const open = expanded.has(contract.id);
            const percent = formatPercent(contract.allocated_total_lifetime, contract.budget_total);
            return (
              <Fragment key={contract.id}>
                <TableRow>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-expanded={open}
                      aria-label={`${open ? "Collapse" : "Expand"} ${contract.block_label}`}
                      onClick={() => toggle(contract.id)}
                    >
                      {open ? "-" : "+"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{contract.contract_code ?? contract.block_label}</div>
                    <div className="text-xs text-muted-foreground">
                      {contract.contract_code ? `${contract.block_label} · ` : ""}
                      {contract.period_label ?? `row ${contract.sheet_row}`}
                      {contract.in_scope_year ? null : ` (no ${accountingYear} rows)`}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatRand(contract.budget_total, BUDGET_NOT_SET)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRand(contract.allocated_total_lifetime)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRand(contract.remaining, BUDGET_NOT_SET)}</TableCell>
                  <TableCell className="text-right tabular-nums">{percent ?? BUDGET_NOT_SET}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRand(contract.allocated_total_in_year)}</TableCell>
                  <TableCell>
                    {contract.complete ? <Badge variant="outline">complete</Badge> : <CompletenessBadges reasons={contract.completeness_reasons} />}
                  </TableCell>
                </TableRow>
                {open ? (
                  <TableRow>
                    <TableCell />
                    <TableCell colSpan={7} className="bg-muted/30">
                      <LinesTable lines={contract.lines} accountingYear={accountingYear} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function LinesTable({ lines, accountingYear }: { lines: FinanceLine[]; accountingYear: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Budget</TableHead>
          <TableHead className="text-right">Allocated (lifetime)</TableHead>
          <TableHead className="text-right">Allocated ({accountingYear} only)</TableHead>
          <TableHead>Binding</TableHead>
          <TableHead>Keys</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={line.line_id}>
            <TableCell>{line.category ?? <span className="text-muted-foreground">(no category)</span>}</TableCell>
            <TableCell className="text-right tabular-nums">{formatRand(line.budget, BUDGET_NOT_SET)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {line.binding === "derived" ? formatRand(line.allocated_lifetime) : formatRand(line.allocated_asserted, "no value")}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {line.binding === "derived" ? formatRand(line.allocated_in_year) : "n/a"}
            </TableCell>
            <TableCell>
              <Badge variant={line.binding === "derived" ? "outline" : "secondary"}>{line.binding}</Badge>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {line.key_column ? `${line.key_column} = ${line.key_values.join(", ")}` : "typed in the sheet"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
