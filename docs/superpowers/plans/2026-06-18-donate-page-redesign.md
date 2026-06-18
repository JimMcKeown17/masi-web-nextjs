# Donate Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/donate` as a unified, on-brand "giving menu" where each card deep-links to DonorBox checkout with the amount and interval pre-filled.

**Architecture:** A server-component page composes presentational client/section components. A single typed data file (`gifts.ts`) is the source of truth for all amounts, copy, and DonorBox campaign routing. One component (`GiftButton`) owns the DonorBox anchor convention; `DonorboxScript` loads `widget.js` after mount so it binds the already-rendered popup anchors. No payment logic lives in our code, DonorBox owns checkout.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, framer-motion, `next/image`. No test runner in this project.

## Global Constraints

Every task implicitly includes these.

- **Design system "Ink & Signal"** (`documentation/design-system.md`). Display/headings/stat numerals use `className="font-serif"` (Fraunces); body is the default sans. Italic accent word in headlines.
- **Colors (literal hex):** ink `#14181D`, paper `#FAF7F2`, white `#FFFFFF`, deep ink `#0E1116`. Accents, ONE per section: children crimson `#C81E3C`, signal red `#E72D4D` (hero accent on dark), youth blue `#1D4ED8` (hover `#a91832` is crimson; blue hover `#1740b0`), graduates gold `#B8860B`. Muted text `text-gray-500/600` on light, `text-white/60`-ish on dark.
- **BANNED:** gradient text (`bg-clip-text`), multi-stop decorative gradients, em dashes (`—`) in any user-facing copy (use comma/period/colon; the `·` middle dot and hyphen are fine), emojis, generic display fonts for headings.
- **Images:** `getImageUrl(path)` from `@/lib/imageUrl`; `next/image` is allowed (`storage.googleapis.com` is in `next.config.ts` remotePatterns).
- **Animation:** `FadeUp`/`FadeRight`/`FadeLeft` from `@/components/animations/FadeAnimations` (props `{children, delay?, duration?, className?}`). Stats use default-export `CountUp` from `@/components/animations/count-up` (props `{to, decimals?, prefix?, suffix?, duration?, className?}`).
- **Verification:** no Jest/Vitest exists. Per task run `pnpm lint` + `npx tsc --noEmit` (type-check). Full `pnpm build` + manual checks at the final task. Do NOT add a test runner.
- **Donor promise (hard rule):** reporting is **programme-level, monthly, never per-child**. Only audited numbers: `$6.50` one-time, `$15`/mo, `$273` one-time, `$185`/mo, `$225`/mo.
- **DonorBox campaigns (verified live, 200):** `masi-literacy`, `masi-jobs`, `masi-scholars`, plus `masi-donations` for custom amount. Deep-link via `amount` + `default_interval=m` (monthly only; one-time inherits the campaign default).
- **Git:** we start on `main`; branch first. Commit per task. End every commit message with the trailer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## Setup (do once, before Task 1)

- [ ] **Create the working branch off `main`:**

```bash
git checkout main && git checkout -b donate-redesign
```

---

### Task 1: DonorBox URL helper

**Files:**
- Create: `src/lib/donorbox.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `type Campaign = 'masi-literacy' | 'masi-jobs' | 'masi-scholars' | 'masi-donations'`; `donorboxUrl(campaign: Campaign, opts?: { amount?: number; monthly?: boolean }): string`.

- [ ] **Step 1: Create the helper**

```ts
// src/lib/donorbox.ts
export type Campaign = 'masi-literacy' | 'masi-jobs' | 'masi-scholars' | 'masi-donations';

const BASE = 'https://donorbox.org';

/**
 * Build a DonorBox campaign URL with the donation amount and interval pre-filled.
 * DonorBox supports forcing monthly via `default_interval=m`; it has NO param to
 * force one-time, so one-time gifts simply omit it and inherit the campaign's
 * one-time default (see the campaign-config note in the design spec).
 */
export function donorboxUrl(
  campaign: Campaign,
  opts: { amount?: number; monthly?: boolean } = {},
): string {
  const params = new URLSearchParams();
  if (opts.amount != null) params.set('amount', String(opts.amount));
  if (opts.monthly) params.set('default_interval', 'm');
  const qs = params.toString();
  return `${BASE}/${campaign}${qs ? `?${qs}` : ''}`;
}
```

- [ ] **Step 2: Sanity-check the query format (no test runner, so verify the logic directly)**

Run:
```bash
node --input-type=module -e "const p=new URLSearchParams();p.set('amount','15');p.set('default_interval','m');console.log('https://donorbox.org/masi-literacy?'+p.toString())"
```
Expected output: `https://donorbox.org/masi-literacy?amount=15&default_interval=m`
(Confirms `URLSearchParams` produces the exact deep-link format, including `6.5` rendering as `6.5`.)

- [ ] **Step 3: Type-check + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/donorbox.ts
git commit -m "feat(donate): add DonorBox deep-link URL helper" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Gift data and types

**Files:**
- Create: `src/components/donate/gifts.ts`

**Interfaces:**
- Consumes: `Campaign` from `@/lib/donorbox`.
- Produces: `interface Gift`, `interface Programme`, `const PROGRAMMES: Programme[]`, `formatAmount(a: number): string`.

- [ ] **Step 1: Create the data module**

```ts
// src/components/donate/gifts.ts
import type { Campaign } from '@/lib/donorbox';

export interface Gift {
  id: string;
  amount: number;        // 6.5, 15, 273, 185, 225
  monthly: boolean;      // false = one-time
  name: string;
  description: string;
  campaign: Campaign;
  badge?: string;        // e.g. "Most chosen"
  note?: string;         // small line next to the interval, e.g. "about R3,500"
}

export interface Programme {
  key: 'children' | 'youth' | 'graduates';
  index: '01' | '02' | '03';
  label: string;                                          // eyebrow
  headline: { lead: string; accent: string; tail?: string }; // accent = italic word(s)
  sub: string;
  accent: string;                                         // hex
  background: string;                                     // section bg hex
  layout: 'row' | 'feature' | 'feature-rev';
  image?: string;                                         // GCS path for feature photo (placeholder)
  gifts: Gift[];
}

/** Render a money figure: integers bare ("$15"), non-integers to cents ("$6.50"). */
export const formatAmount = (a: number): string =>
  Number.isInteger(a) ? `$${a}` : `$${a.toFixed(2)}`;

export const PROGRAMMES: Programme[] = [
  {
    key: 'children',
    index: '01',
    label: 'Children learning to read',
    headline: { lead: 'Teach a child to ', accent: 'read.' },
    sub: "From a child's very first letter-sounds to a whole classroom reading together.",
    accent: '#C81E3C',
    background: '#FFFFFF',
    layout: 'row',
    gifts: [
      {
        id: 'sounds', amount: 6.5, monthly: false, campaign: 'masi-literacy',
        name: "A child's sounds",
        description: 'One learner masters their letter-sounds for a full year through Zazi iZandi, the foundation everything else builds on.',
      },
      {
        id: 'reader', amount: 15, monthly: true, campaign: 'masi-literacy', badge: 'Most chosen',
        name: 'Sponsor a young reader',
        description: 'One child in our intensive literacy programme: a trained local coach and a small group of twelve.',
      },
      {
        id: 'class', amount: 273, monthly: false, campaign: 'masi-literacy',
        name: 'A whole classroom',
        description: 'All 42 children in a class learn their sounds for a year, stretched further by government co-funding.',
      },
    ],
  },
  {
    key: 'youth',
    index: '02',
    label: 'Youth at work',
    headline: { lead: 'One job. ', accent: 'Twelve', tail: ' readers.' },
    sub: 'Our most efficient gift: one salary that does two jobs at once.',
    accent: '#1D4ED8',
    background: '#FAF7F2',
    layout: 'feature',
    image: 'images/Azaluve Mama & Aphathelwe Makabana.webp', // PLACEHOLDER: swap for a coach + learners photo
    gifts: [
      {
        id: 'job', amount: 185, monthly: true, campaign: 'masi-jobs', note: 'about R3,500',
        name: 'Fund a community job',
        description: 'Employ a local young person as a literacy coach. That single salary creates real employment and teaches a class of twelve children to read. The same rand, working twice.',
      },
    ],
  },
  {
    key: 'graduates',
    index: '03',
    label: 'All the way to university',
    headline: { lead: 'Carry a scholar to ', accent: 'graduation.' },
    sub: 'The long game: a top learner, supported every step from matric to a degree.',
    accent: '#B8860B',
    background: '#FFFFFF',
    layout: 'feature-rev',
    image: 'images/tl-photo-1.webp', // PLACEHOLDER: reuses a top-learners graduate photo
    gifts: [
      {
        id: 'scholar', amount: 225, monthly: true, campaign: 'masi-scholars',
        name: 'Sponsor a scholar',
        description: 'Fees, books, and mentoring that carry a top learner all the way through university and into a career that lifts a whole family.',
      },
    ],
  },
];
```

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: no errors (validates every gift's `campaign` against the `Campaign` union).

- [ ] **Step 3: Commit**

```bash
git add src/components/donate/gifts.ts
git commit -m "feat(donate): add giving-menu data and types" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: DonorBox script loader and GiftButton

**Files:**
- Create: `src/components/donate/donorbox-script.tsx`
- Create: `src/components/donate/gift-button.tsx`

**Interfaces:**
- Consumes: `donorboxUrl`, `Campaign` from `@/lib/donorbox`.
- Produces: default `DonorboxScript()` (renders null); default `GiftButton({ campaign, amount?, monthly?, accent, children, className? })`.

- [ ] **Step 1: Create the script loader**

```tsx
// src/components/donate/donorbox-script.tsx
'use client';
import { useEffect } from 'react';

// Loads DonorBox widget.js ONCE. Because this runs in useEffect (after the page
// has rendered), every <a class="dbox-donation-button"> already exists in the DOM
// when the script loads, so widget.js binds them as popup triggers and carries our
// amount/interval query params into the checkout iframe.
export default function DonorboxScript() {
  useEffect(() => {
    if (document.getElementById('donorbox-widget')) return;
    const script = document.createElement('script');
    script.id = 'donorbox-widget';
    script.src = 'https://donorbox.org/widget.js';
    script.setAttribute('paypalExpress', 'true');
    document.body.appendChild(script);
  }, []);
  return null;
}
```

- [ ] **Step 2: Create GiftButton**

```tsx
// src/components/donate/gift-button.tsx
import { donorboxUrl, type Campaign } from '@/lib/donorbox';

interface GiftButtonProps {
  campaign: Campaign;
  amount?: number;
  monthly?: boolean;
  accent: string;            // hex, sets the link color
  children: React.ReactNode;
  className?: string;
}

// The `dbox-donation-button` class is what widget.js (loaded by <DonorboxScript />)
// hooks to open the checkout popup over the page.
export default function GiftButton({ campaign, amount, monthly, accent, children, className = '' }: GiftButtonProps) {
  return (
    <a
      href={donorboxUrl(campaign, { amount, monthly })}
      className={`dbox-donation-button inline-flex items-center gap-1.5 text-sm font-semibold ${className}`}
      style={{ color: accent }}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 3: Type-check + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/donate/donorbox-script.tsx src/components/donate/gift-button.tsx
git commit -m "feat(donate): add DonorBox script loader and gift button" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: GiftCard and FeatureGift

**Files:**
- Create: `src/components/donate/gift-card.tsx`
- Create: `src/components/donate/feature-gift.tsx`

**Interfaces:**
- Consumes: `Gift`, `formatAmount` from `./gifts`; `GiftButton` from `./gift-button`; `getImageUrl` from `@/lib/imageUrl`.
- Produces: default `GiftCard({ gift, accent })`; default `FeatureGift({ gift, accent, image, reversed? })`.

- [ ] **Step 1: Create GiftCard (small card for the children row)**

```tsx
// src/components/donate/gift-card.tsx
import GiftButton from './gift-button';
import { formatAmount, type Gift } from './gifts';

export default function GiftCard({ gift, accent }: { gift: Gift; accent: string }) {
  const highlighted = Boolean(gift.badge);
  return (
    <div
      className="relative flex flex-col rounded-2xl bg-white p-6"
      style={{ borderColor: highlighted ? accent : '#E7E3DB', borderWidth: highlighted ? 2 : 1, borderStyle: 'solid' }}
    >
      {gift.badge && (
        <span
          className="absolute -top-2.5 left-5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
          style={{ backgroundColor: accent }}
        >
          {gift.badge}
        </span>
      )}
      <div className="font-serif text-3xl font-semibold leading-none" style={{ color: highlighted ? accent : '#14181D' }}>
        {formatAmount(gift.amount)}
      </div>
      <div className="mt-1 text-xs text-gray-500">{gift.monthly ? 'per month' : 'one-time'}</div>
      <h3 className="mt-3 text-base font-semibold text-[#14181D]">{gift.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">{gift.description}</p>
      <GiftButton campaign={gift.campaign} amount={gift.amount} monthly={gift.monthly} accent={accent} className="mt-4">
        {gift.monthly ? 'Sponsor monthly' : `Give ${formatAmount(gift.amount)}`} <span aria-hidden>&rarr;</span>
      </GiftButton>
    </div>
  );
}
```

- [ ] **Step 2: Create FeatureGift (wide card for youth + graduates)**

```tsx
// src/components/donate/feature-gift.tsx
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import GiftButton from './gift-button';
import { formatAmount, type Gift } from './gifts';

export default function FeatureGift({
  gift, accent, image, reversed = false,
}: { gift: Gift; accent: string; image: string; reversed?: boolean }) {
  const text = (
    <div className="flex flex-col justify-center p-7 md:p-9">
      <div className="font-serif text-4xl font-semibold leading-none" style={{ color: accent }}>
        {formatAmount(gift.amount)}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {gift.monthly ? 'per month' : 'one-time'}{gift.note ? ` · ${gift.note}` : ''}
      </div>
      <h3 className="mt-3 text-xl font-semibold text-[#14181D]">{gift.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-[15px]">{gift.description}</p>
      <GiftButton campaign={gift.campaign} amount={gift.amount} monthly={gift.monthly} accent={accent} className="mt-4">
        Sponsor monthly <span aria-hidden>&rarr;</span>
      </GiftButton>
    </div>
  );
  const photo = (
    <div className="relative min-h-[220px]">
      <Image src={getImageUrl(image)} alt={gift.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
    </div>
  );
  return (
    <div className="grid max-w-5xl overflow-hidden rounded-2xl border border-[#E7E3DB] bg-white md:grid-cols-2">
      {reversed ? <>{photo}{text}</> : <>{text}{photo}</>}
    </div>
  );
}
```

- [ ] **Step 3: Type-check + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/donate/gift-card.tsx src/components/donate/feature-gift.tsx
git commit -m "feat(donate): add gift card and feature gift components" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: GivingMenu (the three lanes)

**Files:**
- Create: `src/components/donate/giving-menu.tsx`

**Interfaces:**
- Consumes: `PROGRAMMES` from `./gifts`; `GiftCard`, `FeatureGift`; `FadeUp`.
- Produces: default `GivingMenu()`.

- [ ] **Step 1: Create the menu**

```tsx
// src/components/donate/giving-menu.tsx
'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';
import { PROGRAMMES } from './gifts';
import GiftCard from './gift-card';
import FeatureGift from './feature-gift';

export default function GivingMenu() {
  return (
    <>
      {PROGRAMMES.map((p) => (
        <section key={p.key} className="py-16 md:py-24" style={{ backgroundColor: p.background }}>
          <div className="container mx-auto px-4">
            <FadeUp className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="font-serif text-sm italic" style={{ color: p.accent }}>{p.index}</span>
                <span className="h-px w-8" style={{ backgroundColor: p.accent }} />
                <span className="text-xs uppercase tracking-[0.25em] text-gray-500">{p.label}</span>
              </div>
              <h2 className="font-serif text-3xl leading-[1.05] text-[#14181D] md:text-5xl">
                {p.headline.lead}
                <span className="font-light italic" style={{ color: p.accent }}>{p.headline.accent}</span>
                {p.headline.tail}
              </h2>
              <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-gray-600">{p.sub}</p>
            </FadeUp>

            <FadeUp className="mt-8 md:mt-10">
              {p.layout === 'row' ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {p.gifts.map((g) => <GiftCard key={g.id} gift={g} accent={p.accent} />)}
                </div>
              ) : (
                <FeatureGift gift={p.gifts[0]} accent={p.accent} image={p.image!} reversed={p.layout === 'feature-rev'} />
              )}
            </FadeUp>
          </div>
        </section>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/donate/giving-menu.tsx
git commit -m "feat(donate): add giving menu lanes" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: DonateHero (split strip)

**Files:**
- Create: `src/components/donate/donate-hero.tsx`

**Interfaces:**
- Consumes: `CountUp` (default) from `@/components/animations/count-up`; `getImageUrl`; `next/image`.
- Produces: default `DonateHero()`.

- [ ] **Step 1: Create the hero**

```tsx
// src/components/donate/donate-hero.tsx
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import CountUp from '@/components/animations/count-up';

// PLACEHOLDER photo: swap for the strongest donate hero image.
const HERO_IMAGE = 'images/Strip - Child.jpg';

// Audited stats carried from the old page. FACT-CHECK against the data portal
// before merge (design-system rule).
const STATS = [
  { to: 18276, suffix: '', label: 'Children' },
  { to: 364, suffix: '', label: 'Community jobs' },
  { to: 154, suffix: '', label: 'Schools' },
  { to: 100, suffix: '+', label: 'University scholars' },
];

export default function DonateHero() {
  return (
    <section className="grid md:grid-cols-2">
      <div className="flex flex-col justify-center bg-[#0E1116] px-6 py-16 md:px-12 md:py-24">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-10 bg-[#E72D4D]" />
          <span className="text-xs uppercase tracking-[0.25em] text-white/80">Support our work</span>
        </div>
        <h1 className="font-serif text-4xl font-medium leading-[1.04] text-white md:text-6xl">
          Every child reading.<br />
          Every youth <span className="font-light italic text-[#E72D4D]">working.</span>
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/80">
          Choose what your gift builds. Every figure on this page is an audited cost, not a marketing round number.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <CountUp to={s.to} suffix={s.suffix} className="block font-serif text-2xl font-medium text-white md:text-3xl" />
              <span className="mt-1 block text-[11px] uppercase tracking-[0.04em] text-white/60">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-7 max-w-lg border-t border-white/10 pt-4 text-[13px] leading-relaxed text-white/55">
          Every supporter receives <span className="text-white/85">monthly progress reports from the programme they back</span>: results, photos, and stories from the field. Programme-wide updates, not individual-child reports.
        </p>
      </div>
      <div className="relative min-h-[320px] md:min-h-0">
        <Image src={getImageUrl(HERO_IMAGE)} alt="A child learning to read with Masinyusane" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/donate/donate-hero.tsx
git commit -m "feat(donate): add split-strip hero" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: AfterYouGive (3-step strip)

**Files:**
- Create: `src/components/donate/after-you-give.tsx`

**Interfaces:**
- Consumes: `FadeUp`.
- Produces: default `AfterYouGive()`.

- [ ] **Step 1: Create the strip**

```tsx
// src/components/donate/after-you-give.tsx
import { FadeUp } from '@/components/animations/FadeAnimations';

const STEPS = [
  { i: '01', t: 'You choose a gift', d: 'Pick a card, or your own amount. Secure checkout through DonorBox, monthly or one-time.' },
  { i: '02', t: 'We put it to work', d: 'Your gift goes straight into the programme you chose, where the cost figures come from.' },
  { i: '03', t: 'Reports reach you monthly', d: 'Programme progress in your inbox: results, photos, and stories from the work you fund.' },
];

export default function AfterYouGive() {
  return (
    <section className="bg-[#FAF7F2] py-16 md:py-20">
      <div className="container mx-auto px-4">
        <FadeUp>
          <h2 className="font-serif text-2xl font-medium text-[#14181D] md:text-3xl">What happens after you give</h2>
        </FadeUp>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <FadeUp key={s.i} delay={0.1 * i}>
              <div className="font-serif text-base italic text-[#E72D4D]">{s.i}</div>
              <h3 className="mt-2 font-semibold text-[#14181D]">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.d}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/donate/after-you-give.tsx
git commit -m "feat(donate): add 'after you give' steps" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: CustomAmountBand

**Files:**
- Create: `src/components/donate/custom-amount.tsx`

**Interfaces:**
- Consumes: `donorboxUrl` from `@/lib/donorbox`.
- Produces: default `CustomAmountBand()`.

- [ ] **Step 1: Create the band**

```tsx
// src/components/donate/custom-amount.tsx
'use client';
import { useState } from 'react';
import { donorboxUrl } from '@/lib/donorbox';

export default function CustomAmountBand() {
  const [amount, setAmount] = useState('');

  // Custom amount is dynamic, so we open the hosted general campaign in a new tab
  // (query params are guaranteed there). The card grid uses the widget popup.
  const open = () => {
    const value = parseFloat(amount);
    const url = donorboxUrl('masi-donations', Number.isFinite(value) && value > 0 ? { amount: value } : {});
    window.open(url, '_blank', 'noopener');
  };

  return (
    <section className="bg-[#0E1116] py-14 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-2xl font-medium text-white md:text-3xl">Prefer to choose your own amount?</h2>
        <p className="mt-2 max-w-prose text-sm text-white/60">
          Give any amount, one-time or monthly. We will direct it where it is needed most.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-white/15 bg-[#0A0C10] px-3">
            <span className="text-white/50">$</span>
            <input
              type="number" min="3" inputMode="decimal" placeholder="Amount"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-40 bg-transparent px-2 py-3 text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
          <button
            onClick={open}
            className="rounded-lg bg-[#C81E3C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a91832]"
          >
            Continue <span aria-hidden>&rarr;</span>
          </button>
        </div>
        <p className="mt-5 text-[11px] tracking-[0.02em] text-white/45">
          Secure checkout by DonorBox &middot; Cancel a monthly gift anytime &middot; Section 18A tax receipt provided
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/donate/custom-amount.tsx
git commit -m "feat(donate): add custom amount band" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Recompose the page, remove old sections, full verification

**Files:**
- Modify (overwrite): `src/app/donate/page.tsx`
- Modify: `src/app/donate/layout.tsx` (metadata copy)
- Delete: `src/components/donate/hero-section.tsx`, `src/components/donate/impact-section.tsx`

**Interfaces:**
- Consumes: all components from Tasks 3-8; `TrustedBySection` from `@/components/home/trusted-by-section`; `Footer` from `@/components/layout/Footer`.

- [ ] **Step 1: Confirm the old sections have no other importers**

Run: `grep -rn "donate/hero-section\|donate/impact-section" src`
Expected: matches ONLY in `src/app/donate/page.tsx` (which we overwrite next). If anything else imports them, stop and reassess.

- [ ] **Step 2: Overwrite `src/app/donate/page.tsx`**

```tsx
// src/app/donate/page.tsx
import DonateHero from '@/components/donate/donate-hero';
import GivingMenu from '@/components/donate/giving-menu';
import AfterYouGive from '@/components/donate/after-you-give';
import CustomAmountBand from '@/components/donate/custom-amount';
import DonorboxScript from '@/components/donate/donorbox-script';
import TrustedBySection from '@/components/home/trusted-by-section';
import Footer from '@/components/layout/Footer';

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-white">
      <DonateHero />
      <GivingMenu />
      <AfterYouGive />
      <CustomAmountBand />
      <TrustedBySection />
      <Footer />
      <DonorboxScript />
    </main>
  );
}
```

- [ ] **Step 3: Update `src/app/donate/layout.tsx` metadata copy**

Replace the `title` and `description` to match the new framing (drop the stale "women's employment" wording). Keep the rest of the file:

```ts
export const metadata: Metadata = {
  title: "Donate to Masinyusane | Education in South Africa",
  description: "Choose what your gift builds: teach a child to read, fund a community job, or sponsor a university scholar. Every figure is an audited cost.",
  keywords: [
    "donate to education Africa",
    "support literacy South Africa",
    "sponsor a student South Africa",
    "education charity Africa",
    "nonprofit donation South Africa",
  ],
  openGraph: {
    title: "Donate | Masinyusane",
    description: "Teach a child to read, fund a community job, or sponsor a scholar. Every gift is an audited cost.",
    url: "https://www.masinyusane.org/donate",
  },
};
```

- [ ] **Step 4: Delete the superseded components**

```bash
git rm src/components/donate/hero-section.tsx src/components/donate/impact-section.tsx
```

- [ ] **Step 5: Type-check, lint, and full build**

Run: `npx tsc --noEmit && pnpm lint && pnpm build`
Expected: no type/lint errors; build compiles and lists the `/donate` route.

- [ ] **Step 6: Manual verification (run `pnpm dev`, open http://localhost:3000/donate)**

Check all of:
- **Layout:** split-strip hero (deep-ink panel + photo), three color-coded lanes (crimson / blue / gold), feature cards for youth and graduates, the after-you-give strip, the deep-ink custom band, then trusted-by + footer.
- **Design system:** headings in Fraunces; one accent per lane; no gradient text; no em dashes; stats count up.
- **Responsive at 390px:** no horizontal overflow; hero panel and photo stack; the children row collapses to one column; stats wrap.
- **DonorBox deep-links (the flagged risk):** click each card. The DonorBox popup must open with the right amount and interval: `$6.50` one-time, `$15` monthly, `$273` one-time, `$185` monthly, `$225` monthly. Confirm the popup carries the query params (amount + interval), not just the bare campaign.
- **Custom band:** type an amount, Continue opens `masi-donations` in a new tab with that amount.
- **Copy/promise audit:** read every donor-facing line; nothing implies individual-child reporting.

- [ ] **Step 7: If (and only if) the popup does NOT carry the query params**, apply this fallback to `src/components/donate/gift-button.tsx` (open the hosted page in a new tab, which always honors params), then re-run Step 6's DonorBox check:

```tsx
// gift-button.tsx — fallback: drop the popup, open hosted page in a new tab.
export default function GiftButton({ campaign, amount, monthly, accent, children, className = '' }: GiftButtonProps) {
  return (
    <a
      href={donorboxUrl(campaign, { amount, monthly })}
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${className}`}
      style={{ color: accent }}
    >
      {children}
    </a>
  );
}
```
(If the fallback is used, `DonorboxScript` is no longer needed, remove `<DonorboxScript />` and its import from `page.tsx` and delete `donorbox-script.tsx`.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(donate): recompose donate page, remove old sections" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Notes for the implementer

- **Fact-check the four hero stats** (`18,276 / 364 / 154 / 100+`) against the live data portal before this branch merges. Update `STATS` in `donate-hero.tsx` if any are stale.
- **Photos are placeholders.** Youth (`Azaluve Mama & Aphathelwe Makabana.webp`) and the hero (`Strip - Child.jpg`) should be swapped for the strongest donate images when Jim supplies them; graduates reuses a real top-learners graduate photo. Changing them is a one-line edit in `gifts.ts` / `donate-hero.tsx`.
- **Currency** is USD-only by design (DonorBox owns currency). A multi-currency selector would require enabling Multiple Currencies on each DonorBox campaign (likely Pro).
