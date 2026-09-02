import { Badge } from "@/components/ui/badge";
import { formatRand } from "@/lib/finance/money";
import type { CompletenessReason, Severity } from "@/lib/types/finance";

export function reasonLabel(reason: CompletenessReason): string {
  switch (reason.code) {
    case "MISSING_BUDGET":
      return "budget not set";
    case "ASSERTED_LINE":
      return "typed line";
    case "UNBOUND_ALLOCATION":
      return `unbound ${formatRand(reason.amount ?? null)}`;
  }
}

export function CompletenessBadges({ reasons }: { reasons: CompletenessReason[] }) {
  if (reasons.length === 0) return null;
  const labels = Array.from(new Set(reasons.map(reasonLabel)));
  return (
    <span className="inline-flex flex-wrap gap-1">
      {labels.map((label) => (
        <Badge key={label} variant="outline" className="text-xs">
          {label}
        </Badge>
      ))}
    </span>
  );
}

const severityVariant: Record<Severity, "destructive" | "secondary" | "outline"> = {
  error: "destructive",
  warn: "secondary",
  info: "outline",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge variant={severityVariant[severity]}>{severity}</Badge>;
}
