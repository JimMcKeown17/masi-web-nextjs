"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

import { pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { KidFigure } from "./KidFigure";

// One school year, played automatically in five beats: the share of children at the
// reading benchmark in a comparison vs a Masinyusane classroom. Jan / Jun / Nov are
// the stated anchors (confirmed 2026-07-10); Mar / Sep are smoothed midpoints.
const MONTHS_FULL = ["January", "March", "June", "September", "November"];
const COMP_PCT = [5, 7, 10, 18, 27];
const MASI_PCT = [5, 17, 30, 50, 70];
const LAST_BEAT = 4;
const BEAT_INTERVAL_MS = 1600; // four advances: the year plays in about 6.5s

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
  const inView = useInView(ref, { amount: 0.4, once: true });
  const [beat, setBeat] = useState(0);
  const [playCount, setPlayCount] = useState(0); // bumped by the replay button
  const playing = inView && !reduced;

  // Advance one beat per interval until November, restarting whenever replay bumps
  // playCount (the replay handler resets beat to 0). Cleanup guards against unmount
  // mid-play.
  useEffect(() => {
    if (!playing) return;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setBeat(current);
      if (current === LAST_BEAT) clearInterval(id);
    }, BEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [playing, playCount]);

  const total = pick(payload, "class_size")?.numeric_value ?? 42;
  const b = reduced ? LAST_BEAT : beat;
  const compCount = Math.round((total * COMP_PCT[b]) / 100);
  const masiCount = Math.round((total * MASI_PCT[b]) / 100);
  const startCount = Math.round((total * MASI_PCT[0]) / 100);
  const finalComp = Math.round((total * COMP_PCT[LAST_BEAT]) / 100);
  const finalMasi = Math.round((total * MASI_PCT[LAST_BEAT]) / 100);
  const done = !reduced && beat === LAST_BEAT;
  const showPayoff = reduced || done;

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
    <div ref={ref} className="bg-[#0E1116] px-6 py-20 text-white md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-10 bg-[#E72D4D]" />
          <span className="text-xs uppercase tracking-[0.25em] text-white/60">Chapter 01 &middot; Literacy</span>
        </div>
        <h2 className="font-serif text-3xl font-medium leading-[1.12] tracking-tight md:text-[40px]">
          Watch the <span className="font-light italic text-[#E72D4D]">lights come on</span> in two classrooms.
        </h2>

        {/* The year: a single thin line, a red dot travelling Jan to Nov as it plays. */}
        <div className="mt-10">
          <div className="relative h-px bg-white/15">
            <div
              className="absolute left-0 top-0 h-px bg-[#E72D4D] transition-all ease-linear"
              style={{ width: `${(b / LAST_BEAT) * 100}%`, transitionDuration: b === 0 ? "0ms" : `${BEAT_INTERVAL_MS}ms` }}
            />
            <span
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E72D4D] transition-all ease-linear"
              style={{
                left: `${(b / LAST_BEAT) * 100}%`,
                transitionDuration: b === 0 ? "0ms" : `${BEAT_INTERVAL_MS}ms`,
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

        <div className="mt-8 min-h-[24px] text-center text-[15px] leading-relaxed text-gray-300">
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

        {/* The payoff: the section's core claim lands only once the year has played. */}
        <div className="mt-6 min-h-[76px] text-center md:min-h-[44px]">
          {showPayoff && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mx-auto max-w-[640px] font-serif text-2xl leading-snug md:text-[30px]"
            >
              We <span className="font-light italic text-[#E2B53C]">double</span> the number of readers in every
              classroom we enter.
            </motion.p>
          )}
        </div>

        <div className="mt-4 flex h-7 items-center justify-center">
          {done && (
            <button
              type="button"
              onClick={() => {
                setBeat(0);
                setPlayCount((count) => count + 1);
              }}
              className="text-[12px] uppercase tracking-[0.18em] text-white/50 transition-colors hover:text-white"
            >
              Watch the year again
            </button>
          )}
        </div>

        <p className="mt-6 text-[12.5px] text-gray-500">
          <b className="text-gray-400">A reader</b> = a child at the Grade 1 benchmark of 40 letter sounds per minute.
          Class of {total} = average Eastern Cape Grade 1.
        </p>
      </div>
    </div>
  );
}
