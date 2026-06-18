# Donate page redesign — unified giving menu (Ink & Signal)

**Date:** 2026-06-17
**Repo:** Masi frontend (`frontend/masi-website`). No backend changes.
**Status:** Approved (brainstorming) — Layout A, split-strip photo hero.

## Problem

`/donate` is the last page still in the old visual language. It uses everything
the "Ink & Signal" design system bans: gradient-clipped headline text
(`Make a Difference`), multi-stop blue→rose gradients, purple cards, and a generic
"Your Impact Reaches Far" section. It embeds a single DonorBox campaign
(`masi-donations`) in an iframe and asks for an undifferentiated "donation."

A consulting team mocked a stronger idea on the old template: show donors **what a
gift buys** as concrete, costed options. We want that idea, rebuilt in Ink &
Signal, and corrected on the one thing that mattered most to Jim: **we must not
imply individualised reporting we cannot deliver.** We can send monthly
*programme-level* progress reports to anyone backing a programme; we cannot send
per-child reports to individual sponsors.

## Goal

A redesigned `/donate` that:

1. Presents a **unified giving menu across all three programmes** (children /
   youth / graduates), each gift a real, audited cost.
2. Lets a donor click a gift and land in **DonorBox checkout with the amount and
   interval pre-filled** — we own the menu, DonorBox owns payment.
3. States the donor promise honestly: **monthly programme-level reports, never
   per-child reporting.**
4. Reads as the same editorial publication as the rest of the migrated site.

## Decisions locked (brainstorming)

- **Scope:** unified menu spanning all three programmes (not literacy-only).
- **Integration:** custom on-brand cards → deep-linked DonorBox checkout. No
  fully-custom payment form; no attempt to restyle the DonorBox widget itself.
- **Donor promise:** "unit of impact + programme-level reports." Concrete cost
  unit per gift; reporting is programme-wide, not individual-child.
- **Layout:** "A" — three programme lanes, color-coded to the programme palette.
- **Hero:** photographic, "Treatment 2" — split strip (deep-ink text panel beside
  a photo), the design system's signature pattern. (Same family as the existing
  top-learners hero.)
- **DonorBox:** three campaigns, one per programme. Fund is implicit in *which
  campaign* a card links to (DonorBox does not document pre-selecting a
  designation via URL — only `amount` and interval).

## The giving menu (audited numbers — confirmed with Jim 2026-06-17)

| Programme | Gift | Amount | Interval | Unit it buys |
|---|---|---|---|---|
| Children (crimson `#C81E3C`) | A child's sounds | **$6.50** | one-time | One learner's letter-sounds for a year (Zazi iZandi; stretched by govt co-funding) |
| Children | **Sponsor a young reader** *(Most chosen)* | **$15** | monthly | One child in intensive literacy: a coach + a group of 12 |
| Children | A whole classroom | **$273** | one-time | All 42 children in a class learn their sounds for a year ($6.50 × 42) |
| Youth (blue `#1D4ED8`) | Fund a community job | **$185** | monthly | One youth employed as a literacy coach (≈ R3,500); one job, twelve readers |
| Graduates (gold `#B8860B`) | Sponsor a scholar | **$225** | monthly | Fees, books, mentoring through university |

The numbers reconcile: 12 children × $15/mo ≈ the $185 coach salary. The "$185 =
one job *and* twelve readers" overlap is the page's emotional spine and gets the
visual weight (feature card).

## Design

### Page composition — `src/app/donate/page.tsx`

Rebuild the composition (keep `layout.tsx` metadata; refresh copy to drop the old
"women's employment" framing if Jim wants, otherwise leave). New order:

```tsx
<DonateHero />              {/* split strip, deep-ink panel + photo, audited stats */}
<GivingMenu />             {/* three lanes from gift data */}
<AfterYouGive />           {/* 3-step strip, carries the report promise */}
<CustomAmountBand />       {/* deep-ink band: any amount → DonorBox */}
<TrustedBySection />       {/* reuse src/components/home/trusted-by-section.tsx */}
<Footer />
<DonorboxScript />         {/* loads widget.js once, client component */}
```

Background rhythm (design-system alternation): hero deep-ink panel → Children
white → Youth `#FAF7F2` → Graduates white → After-you-give `#FAF7F2` → Custom band
deep-ink `#0E1116`.

### Hero — `src/components/donate/donate-hero.tsx` (replaces `hero-section.tsx`)

Split strip. Left: deep-ink panel (`#0E1116`) with eyebrow (signal-red `#E72D4D`
hairline + uppercase label "Support our work"), serif headline
`Every child reading. / Every youth working.` (italic accent word in `#E72D4D` per
the on-dark accent rule), one-line sub, the four stats as `CountUp` serif numerals,
and the promise line. Right: full-bleed photo via `getImageUrl(...)`.

Promise line (verbatim intent): *"Every supporter receives monthly progress
reports from the programme they back — results, photos, and stories from the field.
Programme-wide updates, not individual-child reports."* (Replace the dash with a
colon per the em-dash ban.)

Follow the existing idiom from `programs/top-learners/hero-section.tsx`: `serif`
inline style or `font-serif`, framer-motion entrance, `getImageUrl`.

### Giving menu — data-driven lanes

**Data:** `src/components/donate/gifts.ts`

```ts
import type { Campaign } from '@/lib/donorbox';

export interface Gift {
  id: string;
  amount: number;          // 6.5, 15, 273, 185, 225
  monthly: boolean;        // false = one-time
  name: string;
  description: string;
  campaign: Campaign;      // which DonorBox campaign (= which fund)
  badge?: string;          // e.g. 'Most chosen'
}

export interface Programme {
  key: 'children' | 'youth' | 'graduates';
  index: '01' | '02' | '03';
  label: string;           // eyebrow
  headline: string;        // e.g. 'Teach a child to <i>read.</i>' — italic span = accent word(s)
  accent: string;          // #C81E3C / #1D4ED8 / #B8860B
  layout: 'row' | 'feature' | 'feature-rev';
  gifts: Gift[];
}

// Copy below is the approved mockup copy (layout-a-v2). Source of truth — the
// mockup lives under gitignored .superpowers/, so it is reproduced here in full.
export const PROGRAMMES: Programme[] = [
  { key: 'children', index: '01', label: 'Children learning to read', accent: '#C81E3C',
    headline: 'Teach a child to <i>read.</i>', layout: 'row', gifts: [
      { id: 'sounds', amount: 6.5, monthly: false, campaign: 'masi-literacy',
        name: "A child's sounds",
        description: "One learner masters their letter-sounds for a full year through Zazi iZandi, the foundation everything else builds on." },
      { id: 'reader', amount: 15, monthly: true, campaign: 'masi-literacy', badge: 'Most chosen',
        name: 'Sponsor a young reader',
        description: 'One child in our intensive literacy programme: a trained local coach and a small group of twelve.' },
      { id: 'class', amount: 273, monthly: false, campaign: 'masi-literacy',
        name: 'A whole classroom',
        description: 'All 42 children in a class learn their sounds for a year, stretched further by government co-funding.' },
    ]},
  { key: 'youth', index: '02', label: 'Youth at work', accent: '#1D4ED8',
    headline: 'One job. <i>Twelve</i> readers.', layout: 'feature', gifts: [
      { id: 'job', amount: 185, monthly: true, campaign: 'masi-jobs',
        name: 'Fund a community job',
        description: 'Employ a local young person as a literacy coach. That single salary creates real employment and teaches a class of twelve children to read. The same rand, working twice.' },
    ]},
  { key: 'graduates', index: '03', label: 'All the way to university', accent: '#B8860B',
    headline: 'Carry a scholar to <i>graduation.</i>', layout: 'feature-rev', gifts: [
      { id: 'scholar', amount: 225, monthly: true, campaign: 'masi-scholars',
        name: 'Sponsor a scholar',
        description: 'Fees, books, and mentoring that carry a top learner all the way through university and into a career that lifts a whole family.' },
    ]},
];
```

(On-dark hero accent uses signal-red `#E72D4D`; the gold lane lifts to `#E2B53C`
only if placed on a dark surface — both per the design-system two-tone rule.)

**Components:**
- `src/components/donate/giving-menu.tsx` — maps `PROGRAMMES`; renders an eyebrow +
  headline + either a `<GiftCard>` row (children) or a `<FeatureGift>` (youth,
  graduates). Each lane commits to its ONE accent (design-system rule).
- `src/components/donate/gift-card.tsx` — small card: serif amount, interval label,
  name, description, and a `<GiftButton>`. Highlighted variant (2px accent border +
  badge) for the `badge` gift.
- `src/components/donate/feature-gift.tsx` — wide 2-col card (text + photo); `rev`
  flips the photo side. Used for the $185 (blue) and $225 (gold) gifts.
- `FadeUp` reveals; stagger card siblings with `delay={0.1 * i}`.

### After you give — `src/components/donate/after-you-give.tsx`

Paper (`#FAF7F2`) strip, three serif-indexed steps:
1. **You choose a gift** — pick a card or your own amount; secure checkout via DonorBox.
2. **We put it to work** — your gift goes into the programme you chose.
3. **Reports reach you monthly** — programme progress in your inbox: results,
   photos, field stories.

Step 3 is where the deliverable promise becomes a commitment in the flow, not fine
print. Wording must be defensible (programme-level).

### Custom amount band — `src/components/donate/custom-amount.tsx`

Deep-ink band. Heading "Prefer to choose your own amount?", a numeric input, and a
`<GiftButton>` that opens the **general** `masi-donations` campaign with `?amount=`.
No currency selector of our own: DonorBox owns currency on its form (avoids a
mismatch). Reassurance line: secure checkout by DonorBox · cancel monthly anytime ·
Section 18A tax receipt (Jim confirmed DonorBox issues receipts).

### DonorBox integration — the deep-link mechanic

**Helper:** `src/lib/donorbox.ts`

```ts
const BASE = 'https://donorbox.org';
export type Campaign = 'masi-literacy' | 'masi-jobs' | 'masi-scholars' | 'masi-donations';

export function donorboxUrl(campaign: Campaign, opts: { amount?: number; monthly?: boolean } = {}) {
  const p = new URLSearchParams();
  if (opts.amount != null) p.set('amount', String(opts.amount));   // verify decimal 6.5 + any minimum on a live form
  if (opts.monthly) p.set('default_interval', 'm');                // no documented one-time value; campaign default = one-time
  const qs = p.toString();
  return `${BASE}/${campaign}${qs ? `?${qs}` : ''}`;
}
```

Confirmed DonorBox URL params (help center): `amount`, `default_interval`
(`w|m|q|a`), `recurring=true`. **Not** documented: pre-selecting a designation —
hence one campaign per programme.

**Open mechanism:** `src/components/donate/gift-button.tsx` renders
`<a class="dbox-donation-button" href={donorboxUrl(...)}>`; `DonorboxScript`
(`src/components/donate/donorbox-script.tsx`) injects `https://donorbox.org/widget.js`
once (same `useEffect` pattern as the current hero), which upgrades those anchors
to popups.

**Risk to verify at build (do not claim done until checked on a live test
campaign):** whether query params propagate through the *popup overlay* (not just
the hosted page). If the popup strips them, fall back to opening the hosted
donorbox.org URL (params definitely work there) in a new tab — still secure, just
leaves the site. Decide based on the live test.

**Campaign config (Jim's setup, tracked separately):** create `masi-literacy`,
`masi-jobs`, `masi-scholars` (copy the existing campaign to keep branding/receipts).
A DonorBox campaign maps to a *programme*, not a single amount — `masi-literacy`
carries all three children's gifts. Per-campaign:

| Campaign | Suggested amounts | Intervals | Default interval |
|---|---|---|---|
| `masi-literacy` | 6.5, 15, 273 | one-time + monthly | **one-time** |
| `masi-jobs` | 185 | monthly (+ one-time ok) | monthly |
| `masi-scholars` | 225 | monthly (+ one-time ok) | monthly |

Rule: default interval = **one-time on any campaign containing a one-time gift**
(literacy), monthly on monthly-only campaigns. Reason: DonorBox links can force
monthly (`default_interval=m`) but have **no param to force one-time**, so one-time
cards must inherit a one-time default or they would open as recurring. Min donation
$3 (all gifts ≥ $6.50); currency USD (DonorBox owns currency; enable Multiple
Currencies only if a ZAR/GBP/EUR selector is wanted — likely Pro). Keep
`masi-donations` for the custom-amount band.

## Components & boundaries

- `DonateHero` — presentational; owns hero photo + stats + promise. No DonorBox.
- `GivingMenu` / `GiftCard` / `FeatureGift` — render from `gifts.ts`; each gift's
  CTA is a `GiftButton` given a `campaign` + `amount` + `monthly`. Knows nothing
  about widget.js.
- `GiftButton` — the only component that knows the DonorBox anchor convention; takes
  `{ campaign, amount, monthly, children }`, builds the URL via `donorbox.ts`.
- `DonorboxScript` — single side-effect: load widget.js. Mounted once in `page.tsx`.
- `gifts.ts` — the single source of truth for amounts, copy, fund mapping. Changing
  a price or a campaign is a one-line data edit (mirrors the `team-section.tsx`
  data-driven pattern Jim likes).
- `lib/donorbox.ts` — pure URL builder; unit-testable, no DOM.

## Assets & data to confirm before ship

- **Photos (placeholders until Jim supplies):** hero split-strip photo; youth
  feature ("coach + 12 learners"); graduate feature (can reuse a
  `programs/top-learners` graduate photo, e.g. `images/tl-photo-1.webp`).
- **Stats fact-check (design-system rule — every number verified against the live
  data portal before shipping):** `18,276` children, `364` jobs, `154` schools,
  `100+` scholars are carried over from the old page. Re-verify or replace.
- **Section 18A line:** confirmed accurate (DonorBox issues receipts).

## Out of scope (YAGNI)

- No custom/embedded payment form, no Stripe/DonorBox API — DonorBox owns checkout.
- No per-child or per-sponsor tracking/reporting machinery (the whole point of the
  programme-level promise).
- No own currency selector — DonorBox owns currency.
- No new backend endpoints.
- No "designation dropdown" — fund is encoded by campaign.

## Verification

- `pnpm build` + `pnpm lint` clean.
- **Design system:** no `bg-clip-text`/gradient text, no em dashes, no emojis; one
  accent per lane; Fraunces headings; paper/white/deep-ink rhythm; `FadeUp` reveals;
  stats use `CountUp`.
- **DonorBox (live test campaign):** each card opens checkout with the right amount;
  monthly cards show monthly pre-selected; one-time cards show one-time; `$6.50`
  decimal and any minimum behave. Confirm popup-vs-hosted param propagation; wire
  the chosen path.
- **Responsive:** desktop + 390px — no overflow, hero photo/panel stack, cards
  reflow to one column, stats wrap.
- **Promise audit:** read every line of donor-facing copy; nothing implies
  individual-child reporting.

## Critical files

- New: `src/components/donate/donate-hero.tsx`, `giving-menu.tsx`, `gift-card.tsx`,
  `feature-gift.tsx`, `feature` photos, `after-you-give.tsx`, `custom-amount.tsx`,
  `gift-button.tsx`, `donorbox-script.tsx`, `gifts.ts`; `src/lib/donorbox.ts`.
- Edit: `src/app/donate/page.tsx` (recompose), `src/app/donate/layout.tsx` (metadata copy).
- Replace/remove: `src/components/donate/hero-section.tsx`,
  `src/components/donate/impact-section.tsx` (superseded).
- Reuse: `src/lib/imageUrl.ts` (`getImageUrl`), `src/components/animations/FadeAnimations.tsx`,
  `src/components/animations/count-up.tsx`, `src/components/home/trusted-by-section.tsx`,
  `src/components/layout/Footer`, `documentation/design-system.md`, and
  `src/components/programs/top-learners/hero-section.tsx` as the photo-hero idiom.
