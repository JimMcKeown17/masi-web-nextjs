"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { outcomeKind } from "@/lib/types/wig";
import type {
  MeasureConfig,
  MeasureValue,
  ProgrammeConfig,
  OutcomesPayload,
  WigOutcomeMetric,
  WigOutcomeMulti,
  WigOutcomeSingle,
  WigOutcomeUnavailable,
} from "@/lib/types/wig";
import { ragStatus, ringFill, formatValue, formatTarget, RAG_HEX } from "@/lib/wig/rag";
import { TERM_LABELS } from "@/lib/wig/config";
import { Ring, InfoTip } from "./primitives";
import { MetricDetailPanel } from "./MetricDetailPanel";

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

function LeadingIndicator({
  cfg,
  measure,
  selected,
  onSelect,
}: {
  cfg: MeasureConfig;
  measure?: MeasureValue;
  selected: boolean;
  onSelect: () => void;
}) {
  const value = measure?.value ?? null;
  const target = targetFor(cfg, measure);
  const status = ragStatus(value, target, cfg.direction);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center text-center w-[150px] rounded-2xl px-2 py-3 transition-all cursor-pointer",
        selected ? "bg-[#f4f7fc] ring-1 ring-[#d6deea] shadow-sm" : "hover:bg-[#fafafa]"
      )}
    >
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
        <InfoTip text={cfg.glossary.intent} interactive={false} />
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5">
        target {formatTarget(target, cfg.scale)}
      </div>
    </button>
  );
}

// Live hero ring: scale is 0-100% of children passing, filled in the programme
// accent, with a tick at the year-end target. No RAG judgment here: a lag
// measure below target mid-year is expected.
function HeroLiveRing({
  outcome,
  target,
  accent,
}: {
  outcome: WigOutcomeSingle;
  target: number;
  accent: string;
}) {
  const R = 108;
  const C = 2 * Math.PI * R;
  const value = outcome.value ?? 0;
  const fill = Math.max(0, Math.min(value, 1));
  const tickAngle = (target * 360 - 90) * (Math.PI / 180);
  const tick = {
    x1: 120 + (R - 9) * Math.cos(tickAngle),
    y1: 120 + (R - 9) * Math.sin(tickAngle),
    x2: 120 + (R + 9) * Math.cos(tickAngle),
    y2: 120 + (R + 9) * Math.sin(tickAngle),
  };
  return (
    <div className="relative w-[240px] h-[240px]">
      <svg width={240} height={240} className="block">
        <circle cx={120} cy={120} r={R} fill="none" stroke="#f0f0f2" strokeWidth={7} />
        <circle
          cx={120}
          cy={120}
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fill)}
          transform="rotate(-90 120 120)"
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
        <line {...tick} stroke="#1c1c1e" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[54px] font-semibold tracking-tight leading-none"
          style={{ color: accent }}
        >
          {Math.round(value * 100)}%
        </span>
        <span className="text-[12px] text-muted-foreground mt-2">
          {TERM_LABELS[outcome.term] ?? outcome.term}
        </span>
      </div>
    </div>
  );
}

// Compact ring for the multi-metric hero: same geometry at 110px.
function MiniOutcomeRing({ metric, accent }: { metric: WigOutcomeMetric; accent: string }) {
  const R = 48;
  const C = 2 * Math.PI * R;
  const fill = Math.max(0, Math.min(metric.value ?? 0, 1));
  const tickAngle = (metric.target * 360 - 90) * (Math.PI / 180);
  const tick = {
    x1: 55 + (R - 6) * Math.cos(tickAngle),
    y1: 55 + (R - 6) * Math.sin(tickAngle),
    x2: 55 + (R + 6) * Math.cos(tickAngle),
    y2: 55 + (R + 6) * Math.sin(tickAngle),
  };
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[110px] h-[110px]">
        <svg width={110} height={110} className="block">
          <circle cx={55} cy={55} r={R} fill="none" stroke="#f0f0f2" strokeWidth={5} />
          <circle
            cx={55} cy={55} r={R} fill="none" stroke={accent} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - fill)}
            transform="rotate(-90 55 55)" style={{ transition: "stroke-dashoffset .6s ease" }}
          />
          <line {...tick} stroke="#1c1c1e" strokeWidth={2} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-semibold tracking-tight leading-none" style={{ color: accent }}>
            {metric.value === null ? "–" : `${Math.round(metric.value * 100)}%`}
          </span>
        </div>
      </div>
      <span className="text-[12px] font-medium mt-1.5">{metric.label}</span>
      <span className="text-[10.5px] text-muted-foreground">target {Math.round(metric.target * 100)}%</span>
    </div>
  );
}

function HeroMultiRings({ outcome, accent }: { outcome: WigOutcomeMulti; accent: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4">
        {outcome.metrics.map((m) => (
          <MiniOutcomeRing key={m.key} metric={m} accent={accent} />
        ))}
      </div>
      <span className="text-[12px] text-muted-foreground mt-3">
        {TERM_LABELS[outcome.term] ?? outcome.term}
      </span>
    </div>
  );
}

function HeroWig({
  programme,
  outcomes,
}: {
  programme: ProgrammeConfig;
  outcomes: OutcomesPayload;
}) {
  const accent = programme.accent ?? "#0a84ff";
  const entry = outcomes.outcomes[programme.key] ?? null;
  const kind = entry ? outcomeKind(entry) : null;
  // Literacy programmes (wig.target in config) are gated by the global
  // literacy source flag; Zazi failures arrive as explicit unavailable entries.
  const literacyWired = programme.wig.target !== undefined;
  const unavailable =
    kind === "unavailable" || (literacyWired && !outcomes.available && kind === null);
  const single = entry && kind === "single" ? (entry as WigOutcomeSingle) : null;
  const multi = entry && kind === "multi" ? (entry as WigOutcomeMulti) : null;
  const target = single ? single.target ?? programme.wig.target : undefined;
  const unavailableNote =
    kind === "unavailable" ? (entry as WigOutcomeUnavailable).note : outcomes.source_note;

  return (
    <div className="flex flex-col items-center text-center shrink-0 lg:w-[320px]">
      {multi ? (
        <HeroMultiRings outcome={multi} accent={accent} />
      ) : single && single.value != null && target !== undefined ? (
        <HeroLiveRing outcome={single} target={target} accent={accent} />
      ) : (
        <div
          className="relative w-[240px] h-[240px]"
          title={unavailable ? unavailableNote ?? undefined : undefined}
        >
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
              {unavailable ? "assessment data unavailable" : "outcome value lands at assessment"}
            </span>
          </div>
        </div>
      )}
      <div
        className="text-[10px] font-bold tracking-[0.12em] uppercase mt-5"
        style={{ color: accent }}
      >
        Wildly Important Goal
      </div>
      <div className="text-[18px] font-semibold leading-[1.35] mt-2 tracking-tight max-w-[320px]">
        {programme.wig.statement}
      </div>
      {single && target !== undefined && single.value != null ? (
        <div className="flex flex-col items-center gap-1 mt-3">
          <span className="text-[11px] text-muted-foreground">
            target {Math.round(target * 100)}%
            {single.baseline?.value != null && (
              <>
                {" · "}
                {single.baseline.term
                  ? TERM_LABELS[single.baseline.term] ?? single.baseline.term
                  : "Baseline"}
                : {Math.round(single.baseline.value * 100)}%
              </>
            )}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {single.numerator ?? "–"}/{single.denominator ?? "–"} passing
            {single.cohort_total !== undefined && (
              <>
                {" · "}
                {single.denominator ?? "–"} of {single.cohort_total} assessed
              </>
            )}
          </span>
        </div>
      ) : multi ? (
        <div className="flex flex-col items-center gap-0.5 mt-3">
          {multi.metrics.map((m) => (
            <span key={m.key} className="text-[11px] text-muted-foreground">
              {m.label}: {m.numerator ?? "–"}/{m.denominator ?? "–"} passing
              {m.baseline?.value != null && <> · baseline {Math.round(m.baseline.value * 100)}%</>}
            </span>
          ))}
        </div>
      ) : (
        <span
          className="inline-block text-[11px] text-muted-foreground bg-[#f5f5f7] rounded-full px-2.5 py-1 mt-3"
          title={unavailable ? unavailableNote ?? undefined : undefined}
        >
          {unavailable ? "Assessment data unavailable" : programme.wig.awaitingLabel}
        </span>
      )}
    </div>
  );
}

export function ProgrammeView({
  programme,
  measures,
  zaziAvailable,
  weekLabel,
  outcomes,
}: {
  programme: ProgrammeConfig;
  measures: Record<string, MeasureValue>;
  zaziAvailable: Record<string, boolean>;
  weekLabel: string;
  outcomes: OutcomesPayload;
}) {
  const onTrack = onTrackCount(programme, measures);
  const total = programme.measures.length;
  const allGood = onTrack === total;
  const zaziDown =
    programme.key.startsWith("zazi_izandi") && zaziAvailable[programme.key] === false;

  const [selectedKey, setSelectedKey] = useState<string | null>(
    programme.measures[0]?.key ?? null
  );
  const selected = programme.measures.find((m) => m.key === selectedKey) ?? null;

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
          <HeroWig programme={programme} outcomes={outcomes} />
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground mb-6">
              Leading Indicators
              <InfoTip text="The weekly behaviours the team controls that drive the WIG. Open the Metrics guide for full definitions." />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-9 justify-items-center">
              {programme.measures.map((m) => (
                <LeadingIndicator
                  key={m.key}
                  cfg={m}
                  measure={measures[m.key]}
                  selected={m.key === selectedKey}
                  onSelect={() => setSelectedKey(m.key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selected && <MetricDetailPanel programmeKey={programme.key} measure={selected} />}
    </div>
  );
}
