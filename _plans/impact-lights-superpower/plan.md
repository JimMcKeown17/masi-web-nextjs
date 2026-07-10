# Impact Page Iteration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework two sections of `/impact`: replace the letter-sounds-framed "ArgumentChain" with a broader "Why it matters" superpower section, and simplify the scroll-pinned "ClassroomLights" scene into a normal-height autoplay animation.

**Architecture:** Two self-contained React component rewrites in `src/components/impact/dashboard/`, wired into `ImpactDashboard.tsx`. Section A is a server component (pure markup). Section B is a client component driven by framer-motion `useInView` + a `setInterval` beat sequencer instead of scroll position.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v4, framer-motion.

**Spec:** `_plans/impact-lights-superpower/design.md` (approved 2026-07-10).

## Global Constraints

- Branch: all work on `feature/impact-lights-superpower`. Run all commands from `/Users/jimmckeown/Development/Masi_Website_2026/frontend/masi-website`.
- **Testing deviation:** this repo has NO unit-test infrastructure (no vitest/jest) and the project standard is "never over-engineer". Do NOT add a test framework. The verification cycle per task is: `pnpm lint` passes, `pnpm build` passes, and visual verification in the browser (Task 3).
- No em dashes anywhere in copy or code comments. No emojis.
- Ink & Signal rules: one accent per section. Section A uses signal red `#E72D4D` on paper `#FAF7F2` with ink `#14181D`. Section B uses signal red accents + lifted gold `#E2B53C` lit figures on deep ink `#0E1116`. No gradient text.
- Serif display via `font-serif` (Fraunces); body stays Geist (default). No Fraunces for full paragraphs.
- Copy is exactly as written in the code blocks below; do not paraphrase.

---

### Task 1: Replace ArgumentChain with WhyItMatters

**Files:**
- Create: `src/components/impact/dashboard/WhyItMatters.tsx`
- Delete: `src/components/impact/dashboard/ArgumentChain.tsx`
- Modify: `src/components/impact/dashboard/ImpactDashboard.tsx` (import + usage, lines 3 and 21)

**Interfaces:**
- Consumes: `Section`, `Kicker`, `Accent` from `./Section`; `IconArray` from `./IconArray`; `pick` from `@/lib/api/impact/selectors`; `PublishedStatsPayload` from `@/lib/types/impact` (all exist already).
- Produces: `export function WhyItMatters({ payload }: { payload: PublishedStatsPayload | null })` consumed by `ImpactDashboard`.

- [ ] **Step 1: Create `WhyItMatters.tsx`**

```tsx
import { pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { Accent, Kicker, Section } from "./Section";
import { IconArray } from "./IconArray";

// The page's "why" section. Frames the mission as reading-as-superpower plus
// numeracy, not letter sounds (letter sounds are the measurement, and are defined
// in the ClassroomLights footnote where they belong).
export function WhyItMatters({ payload }: { payload: PublishedStatsPayload | null }) {
  const pirls = pick(payload, "arg_pirls");

  return (
    <Section className="border-y border-black/5 bg-[#FAF7F2]">
      <Kicker>Why it matters</Kicker>
      <h2 className="max-w-[640px] font-serif text-3xl font-medium leading-[1.12] tracking-tight text-[#14181D] md:text-[40px]">
        South Africa&apos;s future is decided <Accent>before age eight.</Accent>
      </h2>

      <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-center md:gap-16">
        <div className="md:w-[38%] md:shrink-0">
          <IconArray total={10} filled={8} filledVariant="light-shaded" emptyVariant="light-unlit" className="mb-4" />
          {pirls && (
            <>
              <div className="font-serif text-5xl font-medium tracking-tight text-[#14181D] md:text-[58px]">
                {pirls.value}
              </div>
              <p className="mt-2.5 max-w-[250px] text-[14.5px] leading-snug text-gray-600">{pirls.label}.</p>
              <div className="mt-2.5 text-[11.5px] text-gray-400">{pirls.source_system}</div>
            </>
          )}
        </div>
        <p className="max-w-[560px] text-lg leading-relaxed text-gray-700 md:text-xl">
          A child who can&apos;t read can&apos;t learn anything else. Not maths, not science, not a way
          out of poverty. Reading is the <Accent>superpower</Accent> that unlocks all the others.
        </p>
      </div>

      <p className="mt-12 max-w-[640px] font-serif text-2xl leading-snug text-[#14181D]">
        So we build the foundation: <Accent>literacy and numeracy, from age four.</Accent>
      </p>
      <p className="mt-3 text-[13px] text-gray-500">
        In every classroom we enter, twice as many children learn to read. Watch it happen below.
      </p>
    </Section>
  );
}
```

- [ ] **Step 2: Wire into `ImpactDashboard.tsx`**

In `src/components/impact/dashboard/ImpactDashboard.tsx`, replace the import:

```tsx
import { ArgumentChain } from "./ArgumentChain";
```

with:

```tsx
import { WhyItMatters } from "./WhyItMatters";
```

and replace the usage `<ArgumentChain payload={payload} />` with `<WhyItMatters payload={payload} />`. Keep the import list alphabetised (WhyItMatters sorts after ScaleStory; move the import line accordingly and keep the JSX position exactly where ArgumentChain was, directly after `<HeroSection />`).

- [ ] **Step 3: Delete `ArgumentChain.tsx`**

Run: `git rm src/components/impact/dashboard/ArgumentChain.tsx`

- [ ] **Step 4: Verify lint and build pass**

Run: `pnpm lint && pnpm build`
Expected: both exit 0, no references to ArgumentChain remain (build would fail on the dangling import if Step 2 was missed).

- [ ] **Step 5: Commit**

```bash
git add -A src/components/impact/dashboard/
git commit -m "Replace letter-sounds ArgumentChain with WhyItMatters superpower section"
```

---

### Task 2: Simplify ClassroomLights to an autoplay scene

**Files:**
- Modify: `src/components/impact/dashboard/ClassroomLights.tsx` (full rewrite, keep filename and export name)

**Interfaces:**
- Consumes: `KidFigure` from `./KidFigure`; `pick` from `@/lib/api/impact/selectors`; framer-motion `useInView`, `useReducedMotion`, `motion`, `AnimatePresence`.
- Produces: `export function ClassroomLights({ payload }: { payload: PublishedStatsPayload | null })`, same signature as today; `ImpactDashboard` needs no change.

- [ ] **Step 1: Rewrite `ClassroomLights.tsx`**

Replace the entire file content with:

```tsx
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
  // playCount. Cleanup guards against unmount mid-play.
  useEffect(() => {
    if (!playing) return;
    setBeat(0);
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

  // One live sentence, three narrative moments: start, mid-year, year-end.
  const phase = b < 2 ? 0 : b < 4 ? 1 : 2;
  const sentences = [
    <>
      January: both classrooms start in the same place, just{" "}
      <b className="text-white">{startCount} of {total}</b> reading.
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

        <div className="mt-4 flex h-7 items-center justify-center">
          {done && (
            <button
              type="button"
              onClick={() => setPlayCount((count) => count + 1)}
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
```

- [ ] **Step 2: Verify lint and build pass**

Run: `pnpm lint && pnpm build`
Expected: both exit 0. The build confirms the removed framer-motion imports (`useScroll`, `useMotionValueEvent`) left no dangling references.

- [ ] **Step 3: Commit**

```bash
git add src/components/impact/dashboard/ClassroomLights.tsx
git commit -m "Simplify ClassroomLights to autoplay scene, drop scroll-pinning and chrome"
```

---

### Task 3: Browser verification of the full page

**Files:**
- Modify: none expected; fix-ups to Task 1/2 files if verification finds issues.

**Interfaces:**
- Consumes: the running app at `http://localhost:3000/impact` via `pnpm dev`.
- Produces: verified behavior; screenshots for the user.

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev` (background). Expected: ready on `http://localhost:3000`.

- [ ] **Step 2: Verify Section A (desktop ~1440px)**

Open `http://localhost:3000/impact`, scroll to "Why it matters". Check: kicker reads WHY IT MATTERS; headline "South Africa's future is decided before age eight." with red italic serif accent; icon array 8 of 10 filled + PIRLS stat left; superpower paragraph right with only "superpower" accented; closing line "So we build the foundation: literacy and numeracy, from age four."; bridge line beneath. No mention of letter sounds anywhere in the section.

- [ ] **Step 3: Verify Section B autoplay**

Scroll down until the classrooms section is ~half in view. Expected: page scrolls normally (no pinning); the year auto-plays over ~6.5s; red dot travels Jan to Nov; lights turn on staggered in both rooms; counts tick 2 to 11 (comparison) and 2 to 29 (Masi); the live sentence crossfades through its three moments and ends on "By November: 29 children reading, versus 11 next door."; "Watch the year again" appears after the play and restarts the animation when clicked.

- [ ] **Step 4: Verify reduced motion and mobile**

Reduced motion (macOS: System Settings > Accessibility > Display > Reduce motion, or Chrome DevTools rendering emulation `prefers-reduced-motion`): section renders the final November state immediately, no replay button. Mobile (~390px wide viewport): rooms stack vertically, timeline and sentence remain legible, autoplay still fires.

- [ ] **Step 5: Screenshot both sections for the user, commit any fix-ups**

```bash
git add -A && git commit -m "Fix visual issues found in browser verification"  # only if fixes were needed
```
