import { cn } from "@/lib/utils";
import type { MeasureConfig, MeasureValue, ProgrammeConfig } from "@/lib/types/wig";
import { ragStatus, ringFill, formatValue, formatTarget, RAG_HEX } from "@/lib/wig/rag";
import { Ring, InfoTip } from "./primitives";

function targetFor(cfg: MeasureConfig, measure?: MeasureValue): number {
  return measure?.target ?? cfg.target;
}

function LeadingIndicator({ cfg, measure }: { cfg: MeasureConfig; measure?: MeasureValue }) {
  const value = measure?.value ?? null;
  const target = targetFor(cfg, measure);
  const status = ragStatus(value, target, cfg.direction);
  return (
    <div className="flex flex-col items-center text-center w-[130px]">
      <Ring size={130} fill={ringFill(value, target)} color={RAG_HEX[status]}>
        <span
          className="text-[34px] font-semibold tracking-tight leading-none"
          style={{ color: status === "none" ? "#86868b" : RAG_HEX[status] }}
        >
          {formatValue(value, cfg.scale)}
        </span>
        {cfg.unit && <span className="text-[11px] text-muted-foreground mt-0.5">{cfg.unit}</span>}
      </Ring>
      <div className="flex items-center gap-1.5 text-[13px] font-medium mt-3.5">
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
    <div className="flex flex-col items-center text-center shrink-0 lg:w-[300px]">
      <div className="relative w-[200px] h-[200px]">
        <svg width={200} height={200} className="block">
          <circle cx={100} cy={100} r={90} fill="none" stroke="#f0f0f2" strokeWidth={6} />
          <circle
            cx={100}
            cy={100}
            r={90}
            fill="none"
            stroke="#e5e5ea"
            strokeWidth={6}
            strokeDasharray="4 7"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[46px] font-light text-[#c7c7cc] leading-none">–</span>
          <span className="text-[11px] text-muted-foreground mt-1.5 max-w-[130px]">
            outcome value lands at assessment
          </span>
        </div>
      </div>
      <div
        className="text-[10px] font-bold tracking-[0.12em] uppercase mt-4"
        style={{ color: accent }}
      >
        Wildly Important Goal
      </div>
      <div className="text-[17px] font-semibold leading-[1.35] mt-1.5 tracking-tight">
        {programme.wig.statement}
      </div>
      <span className="inline-block text-[11px] text-muted-foreground bg-[#f5f5f7] rounded-full px-2.5 py-1 mt-2.5">
        {programme.wig.awaitingLabel}
      </span>
    </div>
  );
}

export function ProgrammeTile({
  programme,
  measures,
  zaziAvailable,
}: {
  programme: ProgrammeConfig;
  measures: Record<string, MeasureValue>;
  zaziAvailable: boolean;
}) {
  const onTrack = programme.measures.filter(
    (m) => ragStatus(measures[m.key]?.value, targetFor(m, measures[m.key]), m.direction) === "green"
  ).length;
  const total = programme.measures.length;
  const allGood = onTrack === total;

  return (
    <div
      className={cn(
        "bg-white rounded-[26px] p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.06)] border border-[#f1f1f1]",
        programme.featured && "lg:col-span-2"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
          {programme.label}
          {programme.featured && (
            <span className="ml-1.5 normal-case tracking-normal" style={{ color: programme.accent }}>
              · featured
            </span>
          )}
        </span>
        <span
          className={cn(
            "text-[12px] font-semibold rounded-full px-3 py-1 whitespace-nowrap",
            allGood ? "text-[#1a7f37] bg-[#34c759]/10" : "text-[#b45309] bg-[#ff9f0a]/10"
          )}
        >
          {onTrack} / {total} on track
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center mt-2">
        <HeroWig programme={programme} />
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground mb-5">
            Leading Indicators
            <InfoTip text="The weekly behaviours the team controls that drive the WIG. Open the Metrics guide for full definitions." />
            {programme.key === "zazi_izandi" && zaziAvailable === false && (
              <span className="text-[11px] font-normal text-[#ff3b30]">· Zazi backend unavailable</span>
            )}
          </div>
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-7">
            {programme.measures.map((m) => (
              <LeadingIndicator key={m.key} cfg={m} measure={measures[m.key]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
