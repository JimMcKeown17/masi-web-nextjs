import { FadeUp } from "@/components/animations/FadeAnimations";
import { ROLE_META, STEWARDSHIP } from "@/lib/data-map/config";
import { Eyebrow } from "./legend";

// The management payoff: a register of data domains, each with a steward
// slot. Empty slots render as a dashed "awaiting owner" chip, a signature
// line waiting for a name. Fill in `steward` in the config as owners are
// assigned and this table updates itself.

function StewardSlot({ name }: { name: string }) {
  if (name) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white">
        {name}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-white/35 px-3 py-1 font-serif text-xs italic text-white/60">
      awaiting owner
    </span>
  );
}

export function Stewardship() {
  const assigned = STEWARDSHIP.filter((r) => r.steward).length;
  return (
    <section id="stewardship" className="bg-[#0E1116] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp>
          <Eyebrow index="07" label="Stewardship" dark />
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-white max-w-3xl">
            Every dataset needs a
            <span className="italic font-light text-[#EF4A66]"> name on it.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-white/70 text-lg leading-relaxed">
            Dashboards are only as honest as the tables underneath them. Each
            domain below needs exactly one steward: the person leadership
            holds accountable for that data being complete, current and
            correctly keyed at the source. Not the person who types every row,
            the person who answers for it.
          </p>
          <p className="mt-4 font-serif text-white/50 italic">
            {assigned} of {STEWARDSHIP.length} domains currently have a named
            steward.
          </p>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="mt-12 rounded-lg border border-white/10 overflow-hidden">
            <div className="hidden lg:grid lg:grid-cols-[1.15fr_1fr_0.75fr_1.5fr_0.75fr] gap-x-6 px-6 py-3 bg-white/[0.04] text-[11px] uppercase tracking-[0.2em] text-white/40">
              <span>Domain</span>
              <span>Entered by</span>
              <span>Pipeline</span>
              <span>What is at stake</span>
              <span>Steward</span>
            </div>
            <ul className="divide-y divide-white/[0.07]">
              {STEWARDSHIP.map((r) => (
                <li
                  key={r.domain}
                  className="px-6 py-4 grid gap-x-6 gap-y-1.5 lg:grid-cols-[1.15fr_1fr_0.75fr_1.5fr_0.75fr] lg:items-baseline"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-white">
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: ROLE_META[r.role].dark }}
                      aria-hidden
                    />
                    {r.domain}
                  </p>
                  <p className="text-xs text-white/60">{r.enteredBy}</p>
                  <p className="text-xs text-white/60">{r.pipeline}</p>
                  <p className="text-xs leading-relaxed text-white/60">
                    {r.atStake}
                  </p>
                  <div className="lg:justify-self-start">
                    <StewardSlot name={r.steward} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>

        <FadeUp delay={0.25}>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-white/50">
            When a steward is agreed, add their name to the register in{" "}
            <code className="font-mono text-white/60">
              src/lib/data-map/config.ts
            </code>{" "}
            and this page updates itself.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
