"use client";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { getWigDetail } from "@/lib/api/wig";
import type { MeasureConfig, WigDetail } from "@/lib/types/wig";
import { SchoolCoverageGrid } from "@/components/youth-sessions/SchoolCoverageGrid";
import { SessionHeatmapTable, VisitTable, RecordsTable } from "./DetailTables";

// Weekly target for heatmap colouring, derived from the selected measure:
// per-day measures -> x5 working days; sessions/week -> as-is; active coaches
// is participation (>=1 session/week is "active").
function weeklyTargetFor(m: MeasureConfig): number {
  if (m.key.endsWith("active_coaches")) return 1;
  if (m.scale === "per_day") return Math.round(m.target * 5);
  return m.target;
}

function DetailBody({ detail, measure }: { detail: WigDetail; measure: MeasureConfig }) {
  switch (detail.kind) {
    case "session_heatmap":
      return <SessionHeatmapTable detail={detail} weeklyTarget={weeklyTargetFor(measure)} />;
    case "coverage":
      // Both empty (e.g. a cohort with no assigned schools) -> one neutral
      // message, not the grid's contradictory "none covered / all covered".
      if (!detail.covered.length && !detail.uncovered.length) {
        return (
          <p className="text-sm text-muted-foreground text-center py-8">
            No assigned schools for this programme this week.
          </p>
        );
      }
      return <SchoolCoverageGrid data={{ covered: detail.covered, uncovered: detail.uncovered }} />;
    case "visit_table":
      return <VisitTable detail={detail} />;
    case "dq_records":
      return <RecordsTable detail={detail} />;
    default:
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          No drill-down available for this metric yet.
        </p>
      );
  }
}

export function MetricDetailPanel({
  programmeKey,
  measure,
}: {
  programmeKey: string;
  measure: MeasureConfig;
}) {
  const { getToken } = useAuth();
  const { data, error } = useSWR(
    ["wig-detail", programmeKey, measure.key],
    async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return getWigDetail(token, programmeKey, measure.key);
    }
  );

  return (
    <div className="mt-5 bg-white rounded-[22px] border border-[#f1f1f1] shadow-[0_2px_18px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-5 sm:px-7 py-4 border-b border-[#f3f3f3]">
        <div className="text-[14px] font-semibold tracking-tight">{measure.label}</div>
        <div className="text-[12px] text-muted-foreground mt-0.5">{measure.glossary.intent}</div>
      </div>
      <div className="p-4 sm:p-5">
        {/* Mutually exclusive: prefer data (even while revalidating), then error,
            then the first-load skeleton — never a stale table beside an error. */}
        {data ? (
          <DetailBody detail={data} measure={measure} />
        ) : error ? (
          <p className="text-sm text-amber-700 py-6 text-center">
            Couldn&apos;t load the detail. {(error as Error).message}
          </p>
        ) : (
          <div className="h-40 rounded-xl bg-[#f6f6f8] animate-pulse" />
        )}
      </div>
    </div>
  );
}
