"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { KidFigure } from "./KidFigure";

// One school year in five scroll beats: the share of children at the reading benchmark
// in a comparison vs a Masinyusane classroom. Jan / Jun / Nov are the stated anchors
// (confirmed 2026-07-10); Mar / Sep are smoothed midpoints. Scroll drives the year so
// the lights only come on while the reader is watching.
const MONTHS_FULL = ["January", "March", "June", "September", "November"];
const COMP_PCT = [5, 7, 10, 18, 27];
const MASI_PCT = [5, 17, 30, 50, 70];
const LAST_BEAT = 4;

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

  // The timeline dot tracks scroll continuously; the beats only quantise the counts.
  const yearProgress = useTransform(scrollYProgress, (value) => `${value * 100}%`);

  const total = pick(payload, "class_size")?.numeric_value ?? 42;
  const b = reduced ? LAST_BEAT : beat;
  const compCount = Math.round((total * COMP_PCT[b]) / 100);
  const masiCount = Math.round((total * MASI_PCT[b]) / 100);
  const startCount = Math.round((total * MASI_PCT[0]) / 100);
  const finalComp = Math.round((total * COMP_PCT[LAST_BEAT]) / 100);
  const finalMasi = Math.round((total * MASI_PCT[LAST_BEAT]) / 100);

  // One live sentence, three narrative moments: start, mid-year, year-end.
  const phase = b < 2 ? 0 : b < 4 ? 1 : 2;
  const sentences = [
    <>
      January: both classrooms start in the same place, just{" "}
      <b className="text-white">
        {startCount} of {total}
      </b>{" "}
      reading.
    </>,
    <>
      By June, a Masinyusane class is already <b className="text-white">three times</b> ahead.
    </>,
    <>
      By November: <b className="text-white">{finalMasi} children reading</b>, versus{" "}
      <b className="text-white">{finalComp}</b> next door.
    </>,
  ];

  return (
    <div ref={ref} className={reduced ? "bg-[#0E1116]" : "h-[360vh] bg-[#0E1116]"}>
      <div
        className={`${
          reduced ? "" : "sticky top-0 flex h-screen flex-col justify-center"
        } px-6 py-12 text-white md:px-12 lg:px-20`}
      >
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#E72D4D]" />
            <span className="text-xs uppercase tracking-[0.25em] text-white/60">Chapter 01 &middot; Literacy</span>
          </div>
          <h2 className="font-serif text-3xl font-medium leading-[1.12] tracking-tight md:text-[40px]">
            Watch the <span className="font-light italic text-[#E72D4D]">lights come on</span> in two classrooms.
          </h2>
          {/* The core claim, in their face before anything plays. */}
          <p className="mt-4 max-w-[720px] font-serif text-xl leading-snug text-white/90 md:text-[26px]">
            We <span className="font-light italic text-[#E2B53C]">double</span> the number of readers in every
            classroom we enter.
          </p>

          {/* The year: a single thin line, a red dot travelling Jan to Nov as you scroll. */}
          <div className="mt-9">
            <div className="relative h-px bg-white/15">
              <motion.div
                className="absolute left-0 top-0 h-px bg-[#E72D4D]"
                style={{ width: reduced ? "100%" : yearProgress }}
              />
              <motion.span
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E72D4D]"
                style={{
                  left: reduced ? "100%" : yearProgress,
                  boxShadow: "0 0 8px rgba(231,45,77,0.7)",
                }}
              />
            </div>
            <div className="mt-2.5 flex justify-between text-[11px] uppercase tracking-[0.18em] text-white/50">
              <span>Jan</span>
              <span>Nov</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:gap-6">
            <Room title="Comparison classroom" count={compCount} total={total} monthLabel={MONTHS_FULL[b]} />
            <Room title="Masinyusane classroom" count={masiCount} total={total} monthLabel={MONTHS_FULL[b]} highlight />
          </div>

          <div className="mt-7 min-h-[24px] text-center text-[15px] leading-relaxed text-gray-300">
            <AnimatePresence mode="wait">
              <motion.p
                key={phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {sentences[phase]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="mt-5 text-[12.5px] text-gray-500">
            <b className="text-gray-400">A reader</b> = a child at the Grade 1 benchmark of 40 letter sounds per minute.
            Class of {total} = average Eastern Cape Grade 1.
          </p>
        </div>
      </div>
    </div>
  );
}
