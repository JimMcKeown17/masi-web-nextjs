import Link from "next/link";
import type { MeasureValue, ProgrammeConfig } from "@/lib/types/wig";
import { ragStatus, RAG_HEX } from "@/lib/wig/rag";
import { programmeSlug } from "@/lib/wig/config";
import { onTrackCount, targetFor } from "./ProgrammeView";

// Compact summary of one programme on the Overview page: WIG statement,
// "X / N on track", and a dot per leading measure. Click to open its page.
export function ProgrammeRollupCard({
  programme,
  measures,
  zaziAvailable,
}: {
  programme: ProgrammeConfig;
  measures: Record<string, MeasureValue>;
  zaziAvailable: boolean;
}) {
  const onTrack = onTrackCount(programme, measures);
  const total = programme.measures.length;
  const allGood = onTrack === total;
  const accent = programme.accent ?? "#0a84ff";
  const zaziDown = programme.key === "zazi_izandi" && zaziAvailable === false;

  return (
    <Link
      href={`/operations/wig/${programmeSlug(programme.key)}`}
      className="group bg-white rounded-2xl p-5 shadow-[0_2px_18px_rgba(0,0,0,0.05)] border border-[#f1f1f1] hover:shadow-[0_6px_30px_rgba(0,0,0,0.09)] transition-shadow border-l-[3px]"
      style={{ borderLeftColor: accent }}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[12px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
          {programme.label}
        </span>
        <span
          className={
            "text-[11.5px] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap " +
            (allGood ? "text-[#1a7f37] bg-[#34c759]/10" : "text-[#b45309] bg-[#ff9f0a]/10")
          }
        >
          {onTrack} / {total} on track
        </span>
      </div>

      <p className="text-[14px] font-medium leading-snug tracking-tight line-clamp-2 min-h-[2.6em]">
        {programme.wig.statement}
      </p>

      <div className="flex items-center gap-1.5 mt-4">
        {programme.measures.map((m) => {
          const status = ragStatus(measures[m.key]?.value, targetFor(m, measures[m.key]), m.direction);
          return (
            <span
              key={m.key}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: RAG_HEX[status] }}
              title={m.label}
            />
          );
        })}
        <span className="ml-auto text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
          {zaziDown ? "backend unavailable" : programme.wig.awaitingLabel}
        </span>
      </div>
    </Link>
  );
}
