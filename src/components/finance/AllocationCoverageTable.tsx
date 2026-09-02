import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPercent, formatRand, parseMoney } from "@/lib/finance/money";
import type { AllocationCoverage, CompletenessReason, FunderContract } from "@/lib/types/finance";

import { CompletenessBadges } from "./badges";

interface Props {
  coverage: AllocationCoverage[];
  caveats: CompletenessReason[];
  contracts: FunderContract[];
  accountingYear: number;
}

export function AllocationCoverageTable({ coverage, caveats, contracts, accountingYear }: Props) {
  const labels = new Map(
    contracts.map((c) => [c.id, c.contract_code ?? (c.period_label ? `${c.block_label} (${c.period_label})` : c.block_label)]),
  );
  const lines = new Map(contracts.flatMap((c) => c.lines.map((l) => [l.line_id, { contract: labels.get(c.id) ?? c.block_label, line: l }])));
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-xl font-semibold">Allocation coverage by project ({accountingYear})</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Spend per Category 2 in {accountingYear} against the funder allocations tagged to it. This is
        coverage, not budget versus actual; the Masi Budget workbook is a separate, unintegrated source.
      </p>
      {caveats.length > 0 ? (
        <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm dark:bg-amber-950/30">
          Typed budget lines whose money could belong to any project:{" "}
          {caveats.map((caveat, index) => {
            const found = caveat.line_id ? lines.get(caveat.line_id) : undefined;
            const label = found ? `${found.contract} / ${found.line.category ?? "(no category)"}` : caveat.line_id;
            return (
              <span key={caveat.line_id ?? index}>
                {index > 0 ? "; " : ""}
                {label} {formatRand(caveat.amount ?? null)}
              </span>
            );
          })}
          .
        </div>
      ) : null}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project (Category 2)</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Funded</TableHead>
              <TableHead className="text-right">Unfunded</TableHead>
              <TableHead className="text-right">% covered</TableHead>
              <TableHead>Funded by</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coverage.map((entry) => {
              const over = parseMoney(entry.unfunded) < 0;
              const key = entry.category_2 ?? "(no Category 2)";
              return (
                <TableRow key={key}>
                  <TableCell>
                    <div className="font-medium">{key}</div>
                    {entry.category_2_variants.length > 1 ? (
                      <div className="text-xs text-muted-foreground">spellings: {entry.category_2_variants.join(", ")}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatRand(entry.spend)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRand(entry.funded)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {over ? (
                      <Badge variant="destructive">over-allocated by {formatRand(entry.unfunded.slice(1))}</Badge>
                    ) : (
                      formatRand(entry.unfunded)
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatPercent(entry.funded, entry.spend) ?? "n/a"}</TableCell>
                  <TableCell className="text-xs">
                    <ul>
                      {Object.entries(entry.by_contract).map(([id, amount]) => (
                        <li key={id}>
                          {labels.get(id) ?? id}: {formatRand(amount)}
                        </li>
                      ))}
                      {parseMoney(entry.unbound_allocated) !== 0 ? (
                        <li className="text-muted-foreground">no owning contract: {formatRand(entry.unbound_allocated)}</li>
                      ) : null}
                    </ul>
                  </TableCell>
                  <TableCell>
                    {entry.complete ? <Badge variant="outline">complete</Badge> : <CompletenessBadges reasons={entry.completeness_reasons} />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
