import Link from "next/link";
import { outcomeKind } from "@/lib/types/wig";
import type {
  MeasureValue,
  ProgrammeConfig,
  OutcomesPayload,
  WigOutcomeMulti,
  WigOutcomeSingle,
} from "@/lib/types/wig";
import { ragStatus, RAG_HEX } from "@/lib/wig/rag";
import { programmeSlug, TERM_LABELS } from "@/lib/wig/config";
import { onTrackCount, targetFor } from "./ProgrammeView";

// Compact summary of one programme on the Overview page: WIG statement,
// "X / N on track", and a dot per leading measure. Click to open its page.
export function ProgrammeRollupCard({
  programme,
  measures,
  zaziAvailable,
  outcomes,
}: {
  programme: ProgrammeConfig;
  measures: Record<string, MeasureValue>;
  zaziAvailable: Record<string, boolean>;
  outcomes: OutcomesPayload;
}) {
  const onTrack = onTrackCount(programme, measures);
  const total = programme.measures.length;
  const allGood = onTrack === total;
  const accent = programme.accent ?? "#0a84ff";
  const zaziDown =
    programme.key.startsWith("zazi_izandi") && zaziAvailable[programme.key] === false;

  const entry = outcomes.outcomes[programme.key] ?? null;
  const kind = entry ? outcomeKind(entry) : null;
  const single = entry && kind === "single" ? (entry as WigOutcomeSingle) : null;
  const multi = entry && kind === "multi" ? (entry as WigOutcomeMulti) : null;
  const g1 = multi?.metrics.find((m) => m.key === "grade_1") ?? null;
  const multiLabel = multi ? TERM_LABELS[multi.term] ?? multi.term : null;
  const literacyWired = programme.wig.target !== undefined;
  const outcomeUnavailable =
    kind === "unavailable" || (literacyWired && !outcomes.available && kind === null);

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
          {single?.value != null
            ? `${Math.round(single.value * 100)}% · ${TERM_LABELS[single.term] ?? single.term}`
            : multi
              ? g1
                ? `Gr 1: ${g1.value != null ? `${Math.round(g1.value * 100)}%` : "–"} · ${multiLabel}`
                : multiLabel
            : zaziDown
              ? "backend unavailable"
              : outcomeUnavailable
                ? "assessment data unavailable"
                : programme.wig.awaitingLabel}
        </span>
      </div>
    </Link>
  );
}
