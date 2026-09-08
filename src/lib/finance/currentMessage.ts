import type { FinanceCurrent } from "@/lib/types/finance-runs";

// Presentation of the server's compatibility verdict; never recompute compatibility.
export function financeCurrentMessage(current: FinanceCurrent): string {
  switch (current.compatibility_reason?.code) {
    case "SOURCE_MISMATCH":
      return "Current runs are incompatible: they use different Management Accounts sources and cannot be compared. Budget figures retain their pinned ledger.";
    case "DEPENDENCY_UNRESOLVED":
      return "Current runs are incompatible: a Management Accounts dependency could not be verified. Budget figures retain their pinned ledger.";
    case "NO_APPROVED_RUNS":
      return "No approved finance runs are available for this year.";
    default:
      return "Current finance runs cannot be compared until their Management Accounts sources are verified.";
  }
}
