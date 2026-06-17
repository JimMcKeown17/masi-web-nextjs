"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";

import { pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { KidFigure } from "./KidFigure";

// One school year told in five scroll beats. At each beat, the share of children at the
// reading benchmark in a comparison vs a Masinyusane classroom.
// PLACEHOLDER values (Masi, 2026-06-16): Jan / Jun / Nov are the stated anchors; Mar / Sep
// are smoothed midpoints. Verify against the data portal before shipping.
const MONTHS = ["Jan", "Mar", "Jun", "Sep", "Nov"];
const MONTHS_FULL = ["January", "March", "June", "September", "November"];
const COMP_PCT = [5, 7, 10, 18, 27];
const MASI_PCT = [5, 17, 30, 50, 70];

function Room({
  title,
  count,
  total,
  monthLabel,
  highlight = false,
}: {
  title: string;
  count: number;
  total: number;
  monthLabel: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex-1 rounded-2xl border px-6 pb-5 pt-6 ${
        highlight ? "border-[#E2B53C]/25 bg-white/[0.05]" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[13px] font-semibold text-gray-300">{title}</div>
        <div className="text-xs text-gray-500">
          <span className="text-sm font-bold text-[#E2B53C]">{count}</span> of {total}
        </div>
      </div>
      <div className="mt-0.5 text-xs text-gray-500">readers, {monthLabel}</div>
      <div className="mt-4 grid grid-cols-7 justify-items-center gap-x-2 gap-y-3.5">
        {Array.from({ length: total }, (_, index) => {
          // Light up in reading order: left to right, then down a row.
          const lit = index < count;
          return (
            <KidFigure
              key={index}
              variant={lit ? "lit" : "dark-unlit"}
              size={18}
              delayMs={lit ? Math.min(index * 26, 760) : 0}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ClassroomLights({ payload }: { payload: PublishedStatsPayload | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setBeat(progress < 0.18 ? 0 : progress < 0.36 ? 1 : progress < 0.54 ? 2 : progress < 0.72 ? 3 : 4);
  });

  const total = pick(payload, "class_size")?.numeric_value ?? 42;
  const b = reduced ? 4 : beat;
  const compCount = Math.round((total * COMP_PCT[b]) / 100);
  const masiCount = Math.round((total * MASI_PCT[b]) / 100);
  const monthFull = MONTHS_FULL[b];

  // Three narrative beats keyed to the year: start, mid, end.
  const phase = b < 2 ? 0 : b < 4 ? 1 : 2;
  const boxes = [
    <>
      At the start of the year, just <b className="text-white">5%</b> of children read at benchmark, about{" "}
      <b className="text-white">2 of {total}</b>. Both classrooms begin in the same place.
    </>,
    <>
      By mid-year the gap opens. A comparison class reaches <b className="text-white">10%</b> at benchmark. A Masinyusane
      class is already at <b className="text-white">30%</b>.
    </>,
    <>
      By year-end, comparison classes sit at <b className="text-white">27%</b>. Masinyusane classes reach{" "}
      <b className="text-white">70%</b>, about <b className="text-white">29 of {total}</b> children reading.
    </>,
  ];

  return (
    <div ref={ref} className={reduced ? "bg-[#0E1116]" : "h-[460vh] bg-[#0E1116]"}>
      <div
        className={`${reduced ? "" : "sticky top-0 h-screen"} relative flex flex-col justify-center px-6 py-16 text-white md:px-12 lg:px-[70px]`}
      >
        {!reduced && (
          <motion.div
            className="absolute left-0 top-0 h-[3px] w-full origin-left bg-[#E72D4D]"
            style={{ scaleX: scrollYProgress }}
          />
        )}
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#E72D4D]" />
            <span className="text-xs uppercase tracking-[0.25em] text-white/60">Chapter 01 &middot; Literacy</span>
          </div>
          <h2 className="font-serif text-3xl font-medium leading-[1.12] tracking-tight md:text-[40px]">
            Watch the <span className="font-light italic text-[#E72D4D]">lights come on</span> in two classrooms.
          </h2>

          {/* Calendar: months light up Jan to Nov as you scroll */}
          <div className="mt-9 flex items-stretch">
            {MONTHS.map((month, index) => {
              const on = b >= index;
              return (
                <div key={month} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    <div className={`h-px flex-1 ${index > 0 ? (b >= index ? "bg-[#E72D4D]" : "bg-white/15") : "bg-transparent"}`} />
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-500 ${on ? "bg-[#E72D4D]" : "bg-white/20"}`}
                      style={on ? { boxShadow: "0 0 8px rgba(231,45,77,0.7)" } : undefined}
                    />
                    <div className={`h-px flex-1 ${index < MONTHS.length - 1 ? (b > index ? "bg-[#E72D4D]" : "bg-white/15") : "bg-transparent"}`} />
                  </div>
                  <span className={`mt-2 text-[11px] uppercase tracking-[0.18em] transition-colors duration-500 ${on ? "text-white" : "text-white/40"}`}>
                    {month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-9 flex flex-col gap-8 lg:flex-row lg:gap-10">
            <div className="flex w-full flex-col justify-center gap-3 lg:w-[300px] lg:shrink-0">
              {boxes.map((content, index) => (
                <div
                  key={index}
                  className={`rounded-xl px-4 py-3.5 text-sm leading-relaxed transition-all duration-500 ${
                    phase === index
                      ? "border-l-[3px] border-[#E72D4D] bg-white/10 text-gray-50 opacity-100"
                      : "bg-white/[0.04] text-gray-500 opacity-35"
                  }`}
                >
                  {content}
                </div>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:gap-6">
              <Room title="Comparison classroom" count={compCount} total={total} monthLabel={monthFull} />
              <Room title="Masinyusane classroom" count={masiCount} total={total} monthLabel={monthFull} highlight />
            </div>
          </div>
          <p className="mt-6 text-[12.5px] text-gray-500">
            <b className="text-gray-400">A reader</b> = a child at the Grade 1 benchmark of 40 letter sounds per minute.
            Class of {total} = average Eastern Cape Grade 1.
          </p>
        </div>
      </div>
    </div>
  );
}
