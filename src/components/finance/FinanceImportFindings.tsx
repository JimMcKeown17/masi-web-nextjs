import type { FinanceRun, FinanceRunFinding } from '@/lib/types/finance-runs';
import { formatRand } from '@/lib/finance/money';

const titles: Record<string, string> = {
  CATEGORY_NOT_IN_BLOCK: 'Category does not appear in project budget',
  ORPHAN_CONTRACT_CODE: 'Budget reference has no matching project budget',
  MISSING_BUDGET: 'Budget amount missing',
  TEXT_DATE: 'Contract date is stored as text',
  MISSING_CONTRACT_PERIOD: 'Contract dates missing',
  STALE_CACHED_SPENT: 'Workbook spending total needs recalculation',
  OVER_ALLOCATED_COVERAGE: 'Funding allocations exceed spending',
  OVER_ALLOCATED_ROW: 'Allocations exceed this expense',
  MISSING_CONTRACT_KEY: 'Expense allocation is missing a budget reference',
  ORPHAN_CONTRACT_KEY: 'Expense allocation has no matching budget reference',
  WHITESPACE_KEY: 'Budget reference has extra spaces',
  PARSER_WARNING: 'Workbook reading note',
};

function findingCopy(finding: FinanceRunFinding, project?: string) {
  const category = finding.category || 'This budget line';
  if (finding.code === 'ASSERTED_LINE') {
    if (typeof finding.amount === 'string') return {
      title: 'Spending entered manually',
      description: `${category}${project ? ` in ${project}` : ''} uses a directly entered spending amount. It will not update automatically from the Expenditure sheet.`,
    };
    if (finding.amount === null) return {
      title: 'Spending value missing',
      description: `${category}${project ? ` in ${project}` : ''} has no spending amount or formula linking it to the Expenditure sheet.`,
    };
    return { title: 'Spending not linked to expenses', description: finding.message };
  }
  if (finding.code === 'CATEGORY_NOT_IN_BLOCK') {
    const amount = typeof finding.amount === 'string' ? `${formatRand(finding.amount)} in total ` : 'Spending ';
    return { title: titles[finding.code], description: `${amount}is allocated${project ? ` to ${project}` : ' to this project'} under “${finding.category || 'no category'}”, but that category has no matching budget line. Check the expense category and the corresponding project budget.` };
  }
  if (finding.code === 'ORPHAN_CONTRACT_CODE') return {
    title: titles[finding.code], description: 'A reference in the budget-key table has no matching project-budget section. Check that the reference matches the code on the intended project budget.',
  };
  return { title: titles[finding.code] ?? finding.code.replaceAll('_', ' ').toLowerCase().replace(/^./, letter => letter.toUpperCase()), description: finding.message };
}

export function FinanceImportFindings({ run, findings }: { run: FinanceRun; findings: FinanceRunFinding[] }) {
  const contracts = run.kind === 'funders' && run.payload && 'funder_contracts' in run.payload ? run.payload.funder_contracts : [];
  const projects = new Map(contracts.map(project => [project.id, project]));
  const current = findings.filter(finding => finding.in_scope_year);
  const historical = findings.filter(finding => !finding.in_scope_year);
  function rows(items: FinanceRunFinding[]) {
    return <ul className="divide-y">{items.map((finding, index) => {
      const project = finding.contract_id ? projects.get(finding.contract_id) : undefined;
      const copy = findingCopy(finding, project?.block_label);
      return <li key={index} className="space-y-2 py-4 first:pt-0 last:pb-0">
        <h4 className="text-sm font-semibold">{copy.title}</h4>
        <p className="break-words text-sm text-muted-foreground">{copy.description}</p>
        {finding.source_cells?.length ? <p className="break-words text-xs">Source cells: {finding.source_cells.join(', ')}</p> : finding.sheet_row != null && run.kind === 'funders' ? <p className="text-xs">Funder Budgets · Row {finding.sheet_row}</p> : finding.sheet_row != null ? <p className="text-xs">Row {finding.sheet_row}</p> : project ? <p className="text-xs">Funder Budgets · Project section starts at row {project.sheet_row}</p> : null}
        <details className="text-xs text-muted-foreground"><summary className="w-fit cursor-pointer">Technical reference</summary><p className="mt-2 break-words">{finding.code}</p>
          {copy.description !== finding.message ? <p className="mt-1 break-words">{finding.message}</p> : null}
          {finding.source != null ? <p className="mt-1 break-words">Source: {typeof finding.source === 'string' ? finding.source : JSON.stringify(finding.source)}</p> : null}
        </details>
      </li>;
    })}</ul>;
  }
  function groups(items: FinanceRunFinding[], period: string, openErrors: boolean) {
    return (['error', 'warn', 'info'] as const).map(severity => {
      const group = items.filter(finding => finding.severity === severity);
      if (!group.length) return null;
      const label = severity === 'error' ? 'Needs review' : severity === 'warn' ? 'Warnings' : 'Information';
      return <details key={severity} open={openErrors && severity === 'error'} className="rounded-lg border bg-card">
        <summary className="cursor-pointer px-4 py-4 text-sm font-medium">{label} · {period} <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">{group.length}</span></summary>
        <div className="border-t px-4 py-4">{rows(group)}</div>
      </details>;
    });
  }
  return <section aria-label="Findings" className="space-y-3">
    <h3 className="font-semibold">Findings</h3>
    {findings.length === 0 ? <p className="text-sm text-muted-foreground">{run.status === 'failed' ? 'Financial checks have not completed. Resolve the import problem above, then import again to review findings.' : 'No findings.'}</p> : null}
    {groups(current, String(run.accounting_year), true)}
    {historical.length ? <details className="rounded-lg border bg-muted/20"><summary className="cursor-pointer px-4 py-4 text-sm font-medium">Previous years and other periods <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">{historical.length}</span></summary>
      <div className="space-y-3 border-t p-4"><p className="text-sm text-muted-foreground">Outside {run.accounting_year}. Includes previous years and references without a confirmed period.</p>{groups(historical, `Outside ${run.accounting_year}`, false)}</div>
    </details> : null}
  </section>;
}
