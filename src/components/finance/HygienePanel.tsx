import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRand, parseMoney } from "@/lib/finance/money";
import type { Finding, FindingCode, Severity } from "@/lib/types/finance";

import { SeverityBadge } from "./badges";

interface Group {
  code: FindingCode;
  inScope: boolean;
  severity: Severity;
  findings: Finding[];
  total: number;
}

const rank: Record<Severity, number> = { error: 0, warn: 1, info: 2 };

export function groupFindings(findings: Finding[]): Group[] {
  const groups = new Map<string, Group>();
  for (const finding of findings) {
    const key = `${finding.in_scope_year ? "in" : "out"}:${finding.code}`;
    const group = groups.get(key) ?? {
      code: finding.code, inScope: finding.in_scope_year, severity: finding.severity, findings: [], total: 0,
    };
    group.findings.push(finding);
    group.total += finding.amount ? parseMoney(finding.amount) : 0;
    groups.set(key, group);
  }
  return Array.from(groups.values()).sort(
    (a, b) => Number(b.inScope) - Number(a.inScope) || rank[a.severity] - rank[b.severity] || a.code.localeCompare(b.code),
  );
}

export function HygienePanel({ findings, accountingYear }: { findings: Finding[]; accountingYear: number }) {
  const groups = groupFindings(findings);
  const inScope = groups.filter((g) => g.inScope);
  const outOfScope = groups.filter((g) => !g.inScope);
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-semibold">Hygiene</h2>
      <GroupList title={`In ${accountingYear}`} groups={inScope} />
      <GroupList title={`Outside ${accountingYear}`} groups={outOfScope} />
    </section>
  );
}

function GroupList({ title, groups }: { title: string; groups: Group[] }) {
  if (groups.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="grid gap-3">
        {groups.map((group) => (
          <Card key={`${group.inScope}-${group.code}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <span className="font-mono">{group.code}</span>
                <SeverityBadge severity={group.severity} />
                <span className="text-muted-foreground">
                  {group.findings.length} {group.findings.length === 1 ? "finding" : "findings"}, {formatRand(group.total.toFixed(2))}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {group.findings.map((finding, index) => (
                  <li key={`${finding.code}-${index}`}>{finding.message}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
