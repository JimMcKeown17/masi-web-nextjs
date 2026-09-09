"use client";
import type {
  FinanceCurrent,
  FinanceRunManifest,
} from "@/lib/types/finance-runs";
import { BudgetContributors } from "./BudgetContributors";
import { FinanceExportButtons } from "./FinanceExportButtons";
import { ChevronDown, ChevronRight } from "lucide-react";
import { financeCurrentMessage } from "@/lib/finance/currentMessage";
import { useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BudgetVarianceComparison } from "./BudgetVarianceComparison";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRand } from "@/lib/finance/money";
import type {
  BudgetHierarchy,
  BudgetLine,
  BudgetMetric,
  BudgetNode,
  BudgetPayload,
} from "@/lib/types/finance-budgets";

const METRICS: [BudgetMetric, string][] = [
  ["budget", "Budget"],
  ["actual", "Actual"],
  ["projected", "Projected"],
  ["variance_all", "All Funds variance"],
  ["variance_masi", "Masi variance"],
];
const COMPLETENESS_LABELS: Record<string, string> = {
  budget_unavailable: "Budget unavailable",
  actual_unavailable: "Actual unavailable",
  wf_excluded: "Excluded by WF",
  budget_incomplete: "Budget incomplete",
  actual_incomplete: "Actual incomplete",
  projected_incomplete: "Projected amount incomplete",
  variance_all_incomplete: "All Funds variance incomplete",
  variance_masi_incomplete: "Masi variance incomplete",
};
function valueLabel(row: BudgetNode, metric: BudgetMetric) {
  const fallback =
    "known_subtotals" in row
      ? "unavailable (incomplete)"
      : metric === "budget"
        ? "budget not set"
        : metric === "actual"
          ? "actual unavailable"
          : metric === "variance_masi" &&
              row.completeness_reasons.includes("wf_excluded")
            ? "excluded by WF"
            : "unavailable";
  return formatRand(row[metric], fallback);
}
export function FinanceBudgetsView({
  payload,
  manifest,
  runId,
  compatibility,
}: {
  payload: BudgetPayload;
  manifest: FinanceRunManifest;
  runId: string;
  compatibility?: FinanceCurrent;
}) {
  const [selectedLine, setSelectedLine] = useState<BudgetLine>();
  const [department, setDepartment] = useState<BudgetHierarchy>();
  const [varianceMetric, setVarianceMetric] = useState<
    "variance_all" | "variance_masi"
  >("variance_all");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const detailRef = useRef<HTMLHeadingElement>(null);
  const [filter, setFilter] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { hierarchy, lines, projection } = payload;
  const visible: (BudgetHierarchy | BudgetLine)[] = [];
  function visit(parent: string | null) {
    for (const row of [
      ...hierarchy.filter((n) => n.parent_id === parent),
      ...lines.filter((n) => n.parent_id === parent),
    ].sort((a, b) => a.sheet_row - b.sheet_row)) {
      const inDepartment =
        !department ||
        row.id === department.id ||
        ("line_ids" in row
          ? row.line_ids.some((id) => department.line_ids.includes(id))
          : department.line_ids.includes(row.id));
      if (
        inDepartment &&
        (!filter ||
          row.label.toLowerCase().includes(filter.toLowerCase()) ||
          ("line_ids" in row &&
            row.line_ids.some((id) =>
              lines.some(
                (line) =>
                  line.id === id &&
                  line.label.toLowerCase().includes(filter.toLowerCase()),
              ),
            )))
      )
        visible.push(row);
      if ("level" in row && (filter || !collapsed.has(row.id))) visit(row.id);
    }
  }
  visit(null);
  function basis(row: BudgetHierarchy | BudgetLine) {
    return (
      ("calc" in row
        ? `${row.calc?.toLowerCase() === "b" ? "budget used" : "linear projection"}. BC: ${row.bc ?? "unbound"}. Applied share: ${row.actual_share}. Contributors: ${row.ledger_row_count}. ${payload.lines_by_bc.some((group) => group.line_ids.includes(row.id) && group.line_ids.length > 1) ? "Shared BC. " : ""}`
        : "") +
      (row.complete
        ? "Complete"
        : row.completeness_reasons
            .map((reason) => COMPLETENESS_LABELS[reason] ?? reason)
            .join(", "))
    );
  }
  function displayValue(row: BudgetHierarchy | BudgetLine, key: BudgetMetric) {
    return (
      valueLabel(row, key) +
      ("known_subtotals" in row && row[key] === null
        ? `; Known subtotal: ${formatRand(row.known_subtotals[key])}`
        : "")
    );
  }
  const exportRows = [
    [
      "Department / Sub-department / Line",
      ...METRICS.map(([, label]) => label),
      "Basis and completeness",
    ],
    ...visible.map((row) => [
      row.label,
      ...METRICS.map(([key]) => displayValue(row, key)),
      basis(row),
    ]),
  ];
  function exploreDepartment(row: BudgetHierarchy) {
    setDepartment(row);
    setFilter("");
    setCollapsed(new Set());
    detailRef.current?.focus();
  }
  return (
    <Sheet
      open={Boolean(selectedLine)}
      onOpenChange={(open) => {
        if (!open) setSelectedLine(undefined);
      }}
    >
      <section className="min-w-0 space-y-5" aria-label="Budget hierarchy">
        {compatibility && !compatibility.compatible ? (
          <p
            role="status"
            className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
          >
            {financeCurrentMessage(compatibility)}
          </p>
        ) : null}
        <section
          className="rounded-xl border bg-card p-4 sm:p-6"
          aria-labelledby="budget-variance-title"
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="budget-variance-title" className="font-serif text-2xl">
                Projected over / underspend
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sheet as-of: {projection.sheet_as_of}. Month:{" "}
                {projection.month_count}.{" "}
                {payload.summary.complete ? "Complete" : "Incomplete"}.
              </p>
            </div>
            <label className="text-sm text-muted-foreground">
              Compare{" "}
              <select
                aria-label="Variance basis"
                value={varianceMetric}
                onChange={(event) =>
                  setVarianceMetric(event.target.value as typeof varianceMetric)
                }
                className="ml-2 rounded-md border bg-background px-3 py-2 text-foreground"
              >
                <option value="variance_all">All Funds variance</option>
                <option value="variance_masi">Masi variance</option>
              </select>
            </label>
          </div>
          <BudgetVarianceComparison
            departments={hierarchy.filter((row) => row.parent_id === null)}
            metric={varianceMetric}
            onSelect={exploreDepartment}
          />
          <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
            {varianceMetric === "variance_masi"
              ? "Masi variance applies the workbook's WF exclusions. It is not a measure of flexible funding."
              : "Projected expenditure minus budget. Blue indicates below budget, not a judgement that spending is on track."}{" "}
            Unavailable totals remain separate from known subtotals.
          </p>
        </section>
        <section
          className="min-w-0 rounded-xl border bg-card p-4 sm:p-6"
          aria-labelledby="budget-detail-title"
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                ref={detailRef}
                tabIndex={-1}
                id="budget-detail-title"
                className="font-serif text-2xl focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
              >
                {department ? department.label : "Budget detail"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore departments, budget lines and their source expenses.
              </p>
            </div>
            {department ? (
              <Button
                variant="outline"
                onClick={() => setDepartment(undefined)}
              >
                All departments
              </Button>
            ) : null}
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <input
              aria-label="Filter budget rows"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:max-w-xs"
              placeholder="Find a budget line…"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <FinanceExportButtons rows={exportRows} name={`budgets-${runId}`} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department / Sub-department / Line</TableHead>
                {METRICS.map(([key, label]) => (
                  <TableHead key={key}>{label}</TableHead>
                ))}
                <TableHead>Basis and completeness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow
                  key={row.id}
                  className={
                    "level" in row ? "bg-muted/40 font-medium" : undefined
                  }
                >
                  <TableCell
                    className={`max-w-72 whitespace-normal ${"level" in row ? (row.level === 1 ? "pl-2" : "pl-6") : "pl-12"}`}
                  >
                    {"level" in row ? (
                      <Button
                        variant="ghost"
                        className="h-auto max-w-full justify-start whitespace-normal text-left"
                        aria-expanded={!collapsed.has(row.id)}
                        onClick={() =>
                          setCollapsed((previous) => {
                            const next = new Set(previous);
                            if (next.has(row.id)) next.delete(row.id);
                            else next.add(row.id);
                            return next;
                          })
                        }
                      >
                        {collapsed.has(row.id) ? (
                          <ChevronRight
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          />
                        ) : (
                          <ChevronDown
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          />
                        )}
                        {row.label}
                      </Button>
                    ) : (
                      row.label
                    )}
                  </TableCell>
                  {METRICS.map(([key]) => (
                    <TableCell
                      className="tabular-nums whitespace-normal min-w-28 max-w-44"
                      key={key}
                    >
                      {displayValue(row, key)}
                    </TableCell>
                  ))}
                  <TableCell className="whitespace-normal min-w-52 max-w-64">
                    {basis(row)}
                    {"bc" in row && row.bc !== null ? (
                      <Button
                        variant="outline"
                        className="mt-2 h-auto whitespace-normal text-left text-[#1D4ED8] dark:text-blue-300"
                        onClick={(event) => {
                          triggerRef.current = event.currentTarget;
                          setSelectedLine(row);
                        }}
                      >
                        View contributors for {row.label}
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {visible.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No budget rows match this filter.
            </p>
          ) : null}
        </section>
        <details className="rounded-xl border bg-card p-4 text-sm">
          <summary className="cursor-pointer font-medium">
            Budget source and calculation basis
          </summary>
          <div className="mt-3 space-y-2 text-muted-foreground">
            <p>
              Full ledger amounts before budget share. Shared BC contributors
              are shown in full; the explicit applied share belongs to each
              budget line.
            </p>
            {manifest.dependencies.map((dependency, index) => (
              <div className="break-all" key={index}>
                <p>Pinned ledger: {dependency.run_id}</p>
                <p>
                  {dependency.source_name} · {dependency.source_date}
                </p>
                <p>Management Accounts SHA-256: {dependency.source_sha256}</p>
              </div>
            ))}
            <p>
              Budget source: {manifest.source.name} · {manifest.source.date}
            </p>
            <p className="break-all">
              Budget source SHA-256: {manifest.source.sha256}
            </p>
            <p className="break-all">Budget run: {runId}</p>
          </div>
        </details>
        <SheetContent
          className="w-full overflow-y-auto motion-reduce:animate-none motion-reduce:transition-none sm:max-w-4xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <SheetHeader className="border-b px-5 pb-5 pr-12 pt-6">
            <SheetTitle className="font-serif text-2xl">
              {selectedLine?.label ?? "Budget expenses"}
            </SheetTitle>
            <SheetDescription>
              Actual expenditure behind this budget line, from its pinned
              Management Accounts source.
            </SheetDescription>
          </SheetHeader>
          {selectedLine ? (
            <div className="px-5 pb-6">
              <BudgetContributors
                key={`${runId}:${selectedLine.id}`}
                line={selectedLine}
                runId={runId}
                year={manifest.accounting_year}
              />
            </div>
          ) : null}
        </SheetContent>
      </section>
    </Sheet>
  );
}
