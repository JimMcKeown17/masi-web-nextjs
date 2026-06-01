import type { MeasureConfig, MeasureValue, ProgrammeConfig } from "@/lib/types/wig";
import { ragStatus, ringFill, formatValue, formatTarget, RAG_HEX } from "@/lib/wig/rag";
import { Ring, InfoTip } from "./primitives";

export function targetFor(cfg: MeasureConfig, measure?: MeasureValue): number {
  return measure?.target ?? cfg.target;
}

// How many of a programme's leading measures are currently green.
export function onTrackCount(
  programme: ProgrammeConfig,
  measures: Record<string, MeasureValue>
): number {
  return programme.measures.filter(
    (m) => ragStatus(measures[m.key]?.value, targetFor(m, measures[m.key]), m.direction) === "green"
  ).length;
}

function LeadingIndicator({ cfg, measure }: { cfg: MeasureConfig; measure?: MeasureValue }) {
  const value = measure?.value ?? null;
  const target = targetFor(cfg, measure);
  const status = ragStatus(value, target, cfg.direction);
  return (
    <div className="flex flex-col items-center text-center w-[150px]">
      <Ring size={150} fill={ringFill(value, target)} color={RAG_HEX[status]}>
        <span
          className="text-[38px] font-semibold tracking-tight leading-none"
          style={{ color: status === "none" ? "#86868b" : RAG_HEX[status] }}
        >
          {formatValue(value, cfg.scale)}
        </span>
        {cfg.unit && <span className="text-[11px] text-muted-foreground mt-0.5">{cfg.unit}</span>}
      </Ring>
      <div className="flex items-center gap-1.5 text-[14px] font-medium mt-4">
        {cfg.label}
        <InfoTip text={cfg.glossary.intent} />
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5">
        target {formatTarget(target, cfg.scale)}
      </div>
    </div>
  );
}

function HeroWig({ programme }: { programme: ProgrammeConfig }) {
  const accent = programme.accent ?? "#0a84ff";
  return (
    <div className="flex flex-col items-center text-center shrink-0 lg:w-[320px]">
      <div className="relative w-[240px] h-[240px]">
        <svg width={240} height={240} className="block">
          <circle cx={120} cy={120} r={108} fill="none" stroke="#f0f0f2" strokeWidth={7} />
          <circle
            cx={120}
            cy={120}
            r={108}
            fill="none"
            stroke="#e5e5ea"
            strokeWidth={7}
            strokeDasharray="4 8"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[54px] font-light text-[#c7c7cc] leading-none">–</span>
          <span className="text-[12px] text-muted-foreground mt-2 max-w-[150px]">
            outcome value lands at assessment
          </span>
        </div>
      </div>
      <div
        className="text-[10px] font-bold tracking-[0.12em] uppercase mt-5"
        style={{ color: accent }}
      >
        Wildly Important Goal
      </div>
      <div className="text-[18px] font-semibold leading-[1.35] mt-2 tracking-tight max-w-[320px]">
        {programme.wig.statement}
      </div>
      <span className="inline-block text-[11px] text-muted-foreground bg-[#f5f5f7] rounded-full px-2.5 py-1 mt-3">
        {programme.wig.awaitingLabel}
      </span>
    </div>
  );
}

export function ProgrammeView({
  programme,
  measures,
  zaziAvailable,
  weekLabel,
}: {
  programme: ProgrammeConfig;
  measures: Record<string, MeasureValue>;
  zaziAvailable: boolean;
  weekLabel: string;
}) {
  const onTrack = onTrackCount(programme, measures);
  const total = programme.measures.length;
  const allGood = onTrack === total;
  const zaziDown = programme.key === "zazi_izandi" && zaziAvailable === false;

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
        <h1 className="text-2xl font-semibold tracking-tight">{programme.label}</h1>
        <span className="text-sm text-muted-foreground">{weekLabel}</span>
      </div>
      <div className="flex items-center gap-3 mb-7">
        <span
          className={
            "text-[12px] font-semibold rounded-full px-3 py-1 " +
            (allGood ? "text-[#1a7f37] bg-[#34c759]/10" : "text-[#b45309] bg-[#ff9f0a]/10")
          }
        >
          {onTrack} / {total} on track
        </span>
        {zaziDown && (
          <span className="text-[12px] font-medium text-[#ff3b30]">Zazi backend unavailable</span>
        )}
      </div>

      <div className="bg-white rounded-[26px] p-6 sm:p-9 shadow-[0_4px_30px_rgba(0,0,0,0.06)] border border-[#f1f1f1]">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">
          <HeroWig programme={programme} />
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground mb-6">
              Leading Indicators
              <InfoTip text="The weekly behaviours the team controls that drive the WIG. Open the Metrics guide for full definitions." />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-9 justify-items-center">
              {programme.measures.map((m) => (
                <LeadingIndicator key={m.key} cfg={m} measure={measures[m.key]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
