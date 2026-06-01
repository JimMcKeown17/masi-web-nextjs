"use client";
import { cn } from "@/lib/utils";
import { PROGRAMMES } from "@/lib/wig/config";
import { formatTarget } from "@/lib/wig/rag";
import type { MeasureConfig } from "@/lib/types/wig";

// One entry per unique measure across all programmes.
const ENTRIES: MeasureConfig[] = (() => {
  const seen = new Set<string>();
  const out: MeasureConfig[] = [];
  for (const p of PROGRAMMES) {
    for (const m of p.measures) {
      if (!seen.has(m.key)) {
        seen.add(m.key);
        out.push(m);
      }
    }
  }
  return out;
})();

export function MetricsGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 h-screen w-[380px] max-w-[88vw] bg-white/85 backdrop-blur-xl border-l border-black/5 shadow-2xl z-50 overflow-y-auto transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="sticky top-0 bg-white/70 backdrop-blur px-6 pt-6 pb-3.5 border-b border-black/5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-7 h-7 rounded-full bg-[#ececed] grid place-items-center text-muted-foreground hover:bg-[#e0e0e2]"
            aria-label="Close metrics guide"
          >
            ×
          </button>
          <h3 className="text-xl font-bold tracking-tight">Metrics Guide</h3>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            What each indicator means, where it comes from, how it&apos;s calculated.
          </p>
        </div>

        {ENTRIES.map((m) => (
          <div key={m.key} className="px-6 py-4 border-b border-black/5">
            <div className="text-[15px] font-semibold tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              {m.label}
            </div>
            <p className="text-[13px] text-[#3a3a3c] mt-1.5 mb-3 leading-relaxed">{m.glossary.intent}</p>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12px]">
              <span className="text-muted-foreground font-semibold">Source</span>
              <span>{m.glossary.source}</span>
              <span className="text-muted-foreground font-semibold">Formula</span>
              <span>
                <code className="bg-[#f0f0f2] rounded px-1.5 py-0.5 text-[11.5px]">
                  {m.glossary.formula}
                </code>
              </span>
              <span className="text-muted-foreground font-semibold">Target</span>
              <span>
                {m.direction === "lte" ? "≤" : "≥"} {formatTarget(m.target, m.scale)}
              </span>
            </div>
          </div>
        ))}
        <div className="h-8" />
      </aside>
    </>
  );
}
