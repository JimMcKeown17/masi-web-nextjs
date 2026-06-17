import { ReactNode } from "react";

import { PublishedStat } from "@/lib/types/impact";

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-12 md:py-24 lg:px-20">{children}</div>
    </section>
  );
}

// Ink & Signal eyebrow: a hairline in the section's accent + an uppercase tracked label.
// Pass `accent` to match the section's single programme colour; `dark` flips the label
// colour for deep-ink sections.
export function Kicker({
  children,
  accent = "#E72D4D",
  dark = false,
}: {
  children: ReactNode;
  accent?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-px w-10" style={{ backgroundColor: accent }} />
      <span className={`text-xs uppercase tracking-[0.25em] ${dark ? "text-white/60" : "text-gray-500"}`}>{children}</span>
    </div>
  );
}

// A solid italic-serif accent word (replaces the old gradient-clipped text, which the
// Ink & Signal system bans). Defaults to the signal red; pass `accent` for gold/crimson/blue.
export function Accent({ children, accent = "#E72D4D" }: { children: ReactNode; accent?: string }) {
  return (
    <span className="font-serif font-light italic" style={{ color: accent }}>
      {children}
    </span>
  );
}

// Back-compat alias: existing call sites import `GradientText`. It is no longer a gradient.
export const GradientText = Accent;

// A thin accent hairline (replaces the old gradient rule).
export function GradientRule({ accent = "#E72D4D" }: { accent?: string }) {
  return <div className="my-5 h-px w-[90px]" style={{ backgroundColor: accent }} />;
}

export function MethodologyNote({ stat, dark = false }: { stat: PublishedStat | null; dark?: boolean }) {
  if (!stat) return null;
  return (
    <details className={`mt-4 text-[12.5px] ${dark ? "text-gray-500" : "text-gray-400"}`}>
      <summary className="cursor-pointer underline decoration-dotted underline-offset-2">
        Source: {stat.source_system}
      </summary>
      <div className="mt-1 max-w-md leading-relaxed">
        {stat.population && <div>Population: {stat.population}</div>}
        <div>Verified: {stat.as_of}</div>
        {stat.methodology_note && <div>{stat.methodology_note}</div>}
      </div>
    </details>
  );
}
