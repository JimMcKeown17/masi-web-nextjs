# Impact Page Iteration: Lights Scene + Why-It-Matters Section

**Date:** 2026-07-10
**Branch:** `feature/impact-lights-superpower`
**Scope:** Two sections of `/impact`: `ArgumentChain.tsx` and `ClassroomLights.tsx` in
`src/components/impact/dashboard/`. No other sections change.

## Motivation

1. The "Watch the lights come on" scene has too much competing chrome (scroll-pinned
   460vh scene, progress bar, 5-node month calendar, three stacked narrative boxes,
   two grids, counters). The lights-turning-on visual is the point; everything else
   should recede.
2. The "Why letter sounds" section frames Masi too narrowly. Readers can conclude
   letter sounds are the mission. The mission is literacy and numeracy; reading is
   the superpower that unlocks everything else. Letter sounds are a measurement,
   not the mission.

## Section A: "Why it matters" (rework of `ArgumentChain.tsx`)

### Message spine

1. Kicker: `WHY IT MATTERS` (replaces "Why letter sounds")
2. Headline: "South Africa's future is decided *before age eight*."
   ("future" not "reading crisis" - the section now carries literacy + numeracy)
3. Crisis stat: PIRLS, kept. 10-figure icon array with 8 filled, large serif
   "8 of 10", label "children cannot read for meaning by Grade 4", source line.
4. Superpower turn (replaces the "Why?" letter-sounds column): short editorial
   paragraph - "A child who can't read can't learn anything else. Not maths, not
   science, not a way out of poverty. Reading is the superpower that unlocks all
   the others."
5. Closing serif line: "So we build the foundation: *literacy and numeracy, from
   age four*."
6. Bridge line (reworded 2x claim, plain copy not a stat card): "In every
   classroom we enter, twice as many children learn to read. Watch it happen
   below."

### Layout

- Drop the three-equal-columns grid. Asymmetric editorial two-column row under the
  headline: icon array + "8 of 10" stat left (~40%), superpower paragraph right
  (~60%).
- Superpower paragraph is Geist at ~18-20px with generous leading; the single word
  "superpower" is the red italic serif accent. No full-paragraph Fraunces.
- Same paper background `#FAF7F2`, same signal red `#E72D4D`, one accent per
  section (Ink & Signal rules).

### Data

- Keeps `arg_pirls` from the published-stats payload.
- Drops `arg_letter_sounds` and `arg_correlation` from this section (stats stay in
  the payload; the measurement page still covers letter sounds).
- The 2x bridge is copy, not a fetched stat (as today).

## Section B: Simplified lights scene (rework of `ClassroomLights.tsx`)

### Deleted

- 460vh scroll-pinned wrapper, `useScroll` + beat state, top progress bar.
- 5-node month calendar row.
- All three stacked narrative boxes.

### Kept / new behavior

- Normal-height section (one comfortable viewport). Headline unchanged: "Watch the
  *lights come on* in two classrooms." Kicker stays `Chapter 01 - Literacy`.
- Two `Room` grids (comparison vs Masinyusane, 42 `KidFigure`s each) remain the
  hero, side by side (stacked on mobile).
- Autoplay: when the section is ~40% in view (framer-motion `useInView`, fires
  once), the year plays over ~6.5s through the same five anchors:
  Jan 5%/5%, Mar 7%/17%, Jun 10%/30%, Sep 18%/50%, Nov 27%/70%.
  Lights turn on with the existing staggered per-kid transitions; counts tick up.
- Timeline: single thin line, "Jan" left, "Nov" right, small red dot traveling
  across as the year plays (replaces the 5-node calendar).
- One live sentence below the rooms, crossfading at three moments:
  1. "January: both classrooms start in the same place - 2 of 42 reading."
  2. "By June, a Masinyusane class is already three times ahead."
  3. "By November: 29 children reading, versus 11 next door."
  Ends on the punchline and stays.
- Replay: small "Watch the year again" text button appears after play finishes;
  restarts the animation.
- Footnote stays and is where letter sounds now live: "A reader = a child at the
  Grade 1 benchmark of 40 letter sounds per minute. Class of 42 = average Eastern
  Cape Grade 1."
- Numbers: current anchors confirmed by Jim (2026-07-10); remove the PLACEHOLDER
  comment.
- `useReducedMotion`: render the final November state immediately, no animation
  (same spirit as today).

## Amendments (2026-07-11, requested by Jim after initial build)

1. Payoff statement: when the year finishes playing (or immediately under reduced
   motion), a large serif line fades in below the live sentence: "We *double* the
   number of readers in every classroom we enter." ("double" in lifted gold
   `#E2B53C`, tying it to the lit children). This is the section's core claim.
2. To avoid repeating that claim verbatim in adjacent sections, the WhyItMatters
   bridge line shrinks to a pointer: "Watch it happen below, in two classrooms."
3. `KidFigure` gets childlike proportions (head wider than shoulders, small
   rounded body), chosen from a visual comparison of three candidates. Applies
   everywhere the figure is used (classroom grids + icon arrays).

## Verification

- `pnpm build` and `pnpm lint` pass.
- Drive the real page in Chrome at localhost: autoplay triggers on scroll-in,
  replay works, reduced-motion shows final state, mobile width stacks rooms and
  still plays.
