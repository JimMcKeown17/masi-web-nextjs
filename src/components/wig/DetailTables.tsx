import { cn } from "@/lib/utils";
import type {
  SessionHeatmapDetail,
  VisitTableDetail,
  DqRecordsDetail,
} from "@/lib/types/wig";

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{children}</p>;
}

// --- Weekly session heatmap (sessions/day, sessions/week, active coaches) ---

function HeatCell({ count, target }: { count: number; target: number }) {
  const cls =
    count === 0
      ? "bg-[#ffece9] text-[#b42318]"
      : count >= target
      ? "bg-[#e7f8ed] text-[#1a7f37]"
      : "bg-[#fff4e5] text-[#b45309]";
  return (
    <span className={cn("inline-block min-w-[30px] rounded-md px-1.5 py-1 text-[12px] font-semibold tabular-nums", cls)}>
      {count}
    </span>
  );
}

export function SessionHeatmapTable({
  detail,
  weeklyTarget,
}: {
  detail: SessionHeatmapDetail;
  weeklyTarget: number;
}) {
  if (!detail.rows.length) return <Empty>No coaches in this cohort.</Empty>;
  return (
    <div className="overflow-x-auto">
      <p className="text-[12px] text-muted-foreground mb-2 px-1">
        Sessions per coach, per week — last {detail.weeks.length} weeks (green = at/over target {weeklyTarget}/wk).
      </p>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="text-left font-semibold px-3 py-2 sticky left-0 bg-white z-10">Coach</th>
            <th className="text-left font-semibold px-3 py-2 whitespace-nowrap">Mentor</th>
            {detail.weeks.map((w) => (
              <th key={w.start} className="px-2 py-2 text-center font-semibold whitespace-nowrap">{w.label}</th>
            ))}
            <th className="px-3 py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {detail.rows.map((r) => (
            <tr key={r.youth_uid} className="border-t border-[#f1f1f1]">
              <td className="px-3 py-1.5 font-medium sticky left-0 bg-white whitespace-nowrap z-10">{r.full_name}</td>
              <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">{r.mentor_name || "—"}</td>
              {r.weekly_counts.map((c, i) => (
                <td key={i} className="px-1.5 py-1.5 text-center">
                  <HeatCell count={c} target={weeklyTarget} />
                </td>
              ))}
              <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Observation-visit compliance table ---

function FlagMark({ value }: { value: boolean | null }) {
  if (value === true) return <span className="text-[#1a7f37] font-semibold">✓</span>;
  if (value === false) return <span className="text-[#b42318] font-semibold">✗</span>;
  return <span className="text-muted-foreground">—</span>;
}

export function VisitTable({ detail }: { detail: VisitTableDetail }) {
  if (!detail.visits.length) return <Empty>No observation visits in the last completed week.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="text-left font-semibold px-3 py-2 whitespace-nowrap">Date</th>
            <th className="text-left font-semibold px-3 py-2 whitespace-nowrap">Mentor</th>
            <th className="text-left font-semibold px-3 py-2 whitespace-nowrap">School</th>
            {detail.columns.map((c) => (
              <th key={c.key} className="px-2 py-2 text-center font-semibold whitespace-nowrap">{c.label}</th>
            ))}
            <th className="px-3 py-2 text-center font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {detail.visits.map((v, idx) => (
            <tr key={`${v.visit_date}-${v.school_name}-${v.mentor_name}#${idx}`} className="border-t border-[#f1f1f1]">
              <td className="px-3 py-1.5 whitespace-nowrap tabular-nums">{v.visit_date}</td>
              <td className="px-3 py-1.5 whitespace-nowrap">{v.mentor_name}</td>
              <td className="px-3 py-1.5 whitespace-nowrap">{v.school_name}</td>
              {detail.columns.map((c) => (
                <td key={c.key} className="px-2 py-1.5 text-center">
                  <FlagMark value={v.flags[c.key]} />
                </td>
              ))}
              <td className="px-3 py-1.5 text-center">
                <span
                  className={cn(
                    "text-[11px] font-semibold rounded-full px-2 py-0.5",
                    v.compliant ? "text-[#1a7f37] bg-[#34c759]/10" : "text-[#b45309] bg-[#ff9f0a]/10"
                  )}
                >
                  {v.compliant ? "Compliant" : "Gaps"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Generic data-quality record table ---

export function RecordsTable({ detail }: { detail: DqRecordsDetail }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-1 pb-3 flex-wrap">
        <p className="text-[13px] text-muted-foreground">{detail.note}</p>
        <span className="text-[12px] font-semibold whitespace-nowrap">
          {detail.total_flagged} flagged
        </span>
      </div>
      {detail.rows.length === 0 ? (
        <Empty>Nothing flagged — clean.</Empty>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {detail.columns.map((c) => (
                    <th key={c.key} className="text-left font-semibold px-3 py-2 whitespace-nowrap">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.rows.map((row, idx) => (
                  <tr
                    key={`${detail.columns.map((c) => String(row[c.key])).join("|")}#${idx}`}
                    className="border-t border-[#f1f1f1]"
                  >
                    {detail.columns.map((c) => (
                      <td key={c.key} className="px-3 py-1.5 whitespace-nowrap">{row[c.key] ?? "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* The backend caps rows at 100; total_flagged is a semantic count
              (e.g. child-FK counts slots, not rows), so only flag a true cap. */}
          {detail.rows.length >= 100 && (
            <p className="text-[11px] text-muted-foreground px-1 pt-2">
              Showing the first 100 records.
            </p>
          )}
        </>
      )}
    </div>
  );
}
