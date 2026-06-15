# Masinyusane Design System — "Ink & Signal"

The visual language established in the 2026 homepage redesign. Apply it whenever
building or restyling a public-facing page or UI component, so the site reads as
one editorial publication rather than a collection of templates.

**Reference implementation:** the homepage redesign at route `/home-v2-preview`.
Components live in `src/components/home/v3/`. When in doubt, open those files and
copy the pattern.

**One-line summary:** confident editorial nonprofit. A characterful serif for
display, clean sans for body, near-black ink on warm paper, one bold accent per
section, real data shown as proof. No gradients on text, no AI-slop aesthetics.

---

## 1. Typography

Two families, loaded globally in `src/app/layout.tsx`:

| Role | Family | How to apply | Where |
|---|---|---|---|
| Display / headings / stat numerals | **Fraunces** (serif) | `className="font-serif"` | Section headlines, big numbers, pull-quotes, taglines, the brand wordmark |
| Body / labels / buttons / eyebrows | **Geist** (sans, the default) | nothing — it is the default | Paragraphs, nav, buttons, captions, uppercase eyebrows |

- `font-serif` is wired to Fraunces via `--font-serif` in `globals.css`. Prefer
  the utility. (The `v3/` components predate the utility and use an inline
  `style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}`; that is
  equivalent, but new code should use `font-serif`.)
- Fraunces shines in **italic** — use it for the accent word in a headline
  (e.g. "Community *Jobs*", "what *matters.*"). Italics are a feature, not decoration.
- **Numbers are display type.** Wrap stat figures in `font-serif` and animate them
  with `CountUp` (`src/components/animations/count-up.tsx`). Use
  `font-variant-numeric: tabular-nums` (CountUp already does) so digits don't jitter.
- Headline sizing: `text-4xl md:text-6xl leading-[1.05]` for section titles;
  `text-5xl md:text-7xl` for hero/stat numerals. Tighten leading on large serif.
- Do NOT use Fraunces for long body copy — it is a display face. Body stays Geist.

## 2. Color

Defined as literal hex in component classes (not yet tokenized — keep using these
exact values for consistency).

**Neutrals**
- Ink (primary text on light): `#14181D`
- Paper (warm light background for editorial sections): `#FAF7F2`
- White: `#FFFFFF` (programme strips, default)
- Deep ink (dark section background, e.g. the data section): `#0E1116`
- Panel (dark card on deep ink): `#171C24`
- Muted text: `text-gray-500` / `text-gray-600` on light; `text-white/70` on dark

**Accents — one per section, drawn from the three programme areas:**
| Program | Color | Hex | Used for |
|---|---|---|---|
| Early Childhood / children | Crimson | `#C81E3C` | ECE strip, large red fills/bands, CTA button |
| — bright signal red | `#E72D4D` | Hero accent line, mission underline, data-viz, small accents |
| Community Jobs / youth | Blue | `#1D4ED8` (hover `#1740b0`) | Jobs strip + band |
| Scholarship Fund / graduates | Gold | `#B8860B` | Scholarship/graduates section |

Two reds is intentional: `#C81E3C` is the deeper brand crimson for large fills and
backgrounds; `#E72D4D` is the brighter "signal" red for thin accent lines, links,
and data visualization. Don't introduce a third red.

**Accent rule:** each section commits to ONE accent. The eyebrow rule, the headline
accent word, the buttons, and any underline in that section all use the same color.
Don't mix programme colors within a section.

## 3. Banned (these read as generic / AI-generated)

- **Gradient text** — no `bg-gradient-* bg-clip-text text-transparent`. The old site
  leaned on this heavily; the redesign removed all of it. Headlines are solid ink or
  a solid accent, with an italic accent word for emphasis.
- **Multi-stop decorative gradients** as the main visual interest (the purple-on-white
  look). Use solid color, warm paper, or a single dark panel instead.
- **Em dashes (—)** in copy. They're a strong AI tell. Use a comma, period, or colon.
  (En dashes in number ranges like "2–13" are fine.)
- **Generic display fonts** (Inter, Roboto, system-ui) for headings. Display is Fraunces.
- **Emojis** anywhere (existing repo rule).

## 4. Recurring patterns

**Eyebrow** (section label above a headline):
```tsx
<div className="flex items-center gap-3 mb-6">
  <span className="font-serif text-sm italic text-[#C81E3C]">01</span>   {/* optional index */}
  <span className="h-px w-10 bg-[#C81E3C]" />
  <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our programmes</span>
</div>
```

**Headline** (solid ink with an italic accent word):
```tsx
<h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
  Early Childhood
  <br />
  <span className="italic font-light text-[#C81E3C]">Education</span>
</h2>
```

**Stat** (serif numeral + count-up + caption):
```tsx
<span className="font-serif">
  <CountUp to={1.9} decimals={1} suffix="x" className="block text-5xl md:text-7xl font-medium" />
</span>
<p className="text-white/85 max-w-[26ch]">We double the number of children hitting reading benchmarks.</p>
```

**Buttons**
- Primary: `bg-[ACCENT] hover:bg-[DARKER] text-white px-7 py-3.5 rounded-md font-medium`
- Secondary (inline): underline link — `text-[#14181D] font-medium border-b-2 border-[ACCENT] pb-0.5 hover:text-[ACCENT]`
- Tertiary: a circular play button (`rounded-full border` with a `lucide-react` icon)

**Programme strip** (text + bleeding photo): alternate the photo side section to
section for an editorial zigzag. Use `grid md:grid-cols-2 items-end` and scale the
photo (`scale-115`/`scale-130 origin-bottom`) so it bleeds into the colored band
below. Match photo rendered heights across strips so sections feel equally full.

## 5. Motion

- Scroll reveals: `FadeUp` / `FadeRight` / `FadeLeft` from
  `src/components/animations/FadeAnimations.tsx` (framer-motion, `whileInView`,
  `once: true`). Stagger siblings with `delay={0.1 * i}`.
- Counting numbers: `CountUp` (cubic ease-out, fires once on in-view).
- Data viz draws itself on scroll (see `v3/radar-chart-v3.tsx` — rAF progress 0→1).
- Keep it to high-impact moments: one orchestrated reveal per section beats
  scattered micro-interactions.

## 6. Layout & rhythm

- Width: `container mx-auto px-4`.
- Section padding: `py-20 md:py-28` for editorial sections; `py-16 md:py-20` for
  stat bands.
- Generous negative space on light sections; controlled density on dark panels.
- Always verify at 390px width: no horizontal overflow, photos/charts scale, labels
  don't clip.

## 7. Copy voice

Confident, evidence-led, specific. Lead with proof. Let the data carry the claim.
House lines worth echoing:
- "What happens when you flood a township with graduates? We're going to find out."
- "Every child reading. Every youth working."
- Frame stats as audited facts, not marketing ("19,228 children", not "thousands").

Fact-check every number against the live data portal before shipping. Placeholder
figures (e.g. the radar values) must be flagged in code comments.

## 8. Migration checklist (per page)

When restyling an existing page to this system:
1. Swap display headings to `font-serif`; keep body in Geist.
2. Remove every `bg-clip-text` gradient; replace with solid ink/accent + italic accent word.
3. Pick the section's ONE accent from the programme palette.
4. Replace em dashes in copy.
5. Add eyebrows, wrap stats in serif + `CountUp`.
6. Convert backgrounds to white / `#FAF7F2` / dark panel as appropriate.
7. Add `FadeUp`-style scroll reveals.
8. Verify desktop + 390px mobile in the browser before claiming done.
