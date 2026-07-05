import { FadeUp } from "@/components/animations/FadeAnimations";
import {
  BRIDGE,
  CAPTURE_SOURCES,
  DASHBOARDS,
  MASI_BACKEND,
  SERVING_CHANNELS,
  ZAZI_BACKEND,
  BackendSpec,
  Role,
  ROLE_META,
} from "@/lib/data-map/config";
import { Eyebrow, RoleLegend } from "./legend";

// The centrepiece: capture -> canonical stores -> serving -> decisions,
// rendered as four lanes on a deep-ink panel. Left to right on desktop,
// top to bottom on mobile.

function LaneHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-2 border-b border-white/10 pb-2">
      <span className="font-serif italic text-sm text-[#EF4A66]">{index}</span>
      <span className="text-xs tracking-[0.22em] uppercase text-white/60">
        {title}
      </span>
    </div>
  );
}

// Desktop: a slim column with a rightward chevron. Mobile: a downward one.
function FlowGap() {
  return (
    <>
      {/* Top-aligned so the chevron sits at lane-header height, not lost in
          the middle of lanes of very different lengths. */}
      <div className="hidden lg:flex items-start justify-center pt-2 text-white/30">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 8h9M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex lg:hidden justify-center py-1 text-white/25">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 3v9M4.5 9 8 12.5 11.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "live") {
    return (
      <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
        live
      </span>
    );
  }
  return (
    <span className="rounded-full border border-dashed border-white/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
      {status}
    </span>
  );
}

function RoleGroup({ role, names }: { role: Role; names: string[] }) {
  return (
    <div className="mt-3">
      <p
        className="text-[10px] uppercase tracking-[0.18em]"
        style={{ color: ROLE_META[role].dark }}
      >
        {ROLE_META[role].plural}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {names.map((n) => (
          <span
            key={n}
            className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] leading-none text-white/80"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: ROLE_META[role].dark }}
              aria-hidden
            />
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function BackendCard({ backend }: { backend: BackendSpec }) {
  const byRole = (role: Role) =>
    backend.datasets.filter((d) => d.role === role).map((d) => d.name);
  return (
    <div className="rounded-lg border border-white/10 bg-[#171C24] p-5">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <h3 className="font-serif text-xl text-white">{backend.name}</h3>
        <code className="font-mono text-[11px] text-white/40">{backend.db}</code>
      </div>
      <p className="mt-0.5 text-xs text-white/40">{backend.stack}</p>
      <RoleGroup role="canonical" names={byRole("canonical")} />
      <RoleGroup role="event" names={byRole("event")} />
      <RoleGroup role="derived" names={byRole("derived")} />
    </div>
  );
}

function Bridge() {
  return (
    <div className="relative my-1 rounded-lg border border-dashed border-white/20 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
        The bridge
      </p>
      <p className="mt-1.5 text-xs text-white/75">
        <span className="text-white/40">down:</span> {BRIDGE.masiToZazi}
      </p>
      <p className="mt-1 text-xs text-white/75">
        <span className="text-white/40">up:</span> {BRIDGE.zaziToMasi}
      </p>
      <p className="mt-1.5 text-[11px] leading-snug text-white/40">
        {BRIDGE.transport}
      </p>
    </div>
  );
}

export function SystemMap() {
  return (
    <section id="map" className="bg-[#0E1116] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp>
          <Eyebrow index="03" label="The map" dark />
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-white">
            The wiring,
            <span className="italic font-light text-[#EF4A66]"> end to end.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-white/70 text-lg leading-relaxed">
            Four steps. Staff capture the work where they are; syncs carry it
            into the canonical stores; APIs serve it out; dashboards turn it
            into decisions.
          </p>
          <div className="mt-6">
            <RoleLegend dark />
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="mt-12 grid gap-y-2 lg:grid-cols-[1fr_28px_1.45fr_28px_1fr_28px_1fr] lg:gap-x-0">
            {/* Lane 1: capture */}
            <div>
              <LaneHeader index="a" title="Capture" />
              <div className="space-y-3">
                {CAPTURE_SOURCES.map((s) => (
                  <div
                    key={s.name}
                    className="rounded-lg border border-white/10 bg-[#171C24] p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-white">
                        {s.name}
                      </h3>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                      {s.description}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
                      feeds the {s.feeds}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <FlowGap />

            {/* Lane 2: the two canonical stores + the bridge between them */}
            <div>
              <LaneHeader index="b" title="Canonical stores" />
              <div className="space-y-3">
                <BackendCard backend={MASI_BACKEND} />
                <Bridge />
                <BackendCard backend={ZAZI_BACKEND} />
              </div>
            </div>

            <FlowGap />

            {/* Lane 3: serving */}
            <div>
              <LaneHeader index="c" title="Serving" />
              <div className="space-y-3">
                {SERVING_CHANNELS.map((c) => (
                  <div
                    key={c.name}
                    className="rounded-lg border border-white/10 bg-[#171C24] p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-white">
                        {c.name}
                      </h3>
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
                        {c.auth}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                      {c.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <FlowGap />

            {/* Lane 4: decisions */}
            <div>
              <LaneHeader index="d" title="Decisions" />
              <div className="rounded-lg border border-white/10 bg-[#171C24] p-4">
                <ul className="divide-y divide-white/[0.06]">
                  {DASHBOARDS.map((d) => (
                    <li key={d.name} className="py-2 first:pt-0 last:pb-0">
                      <p className="text-sm text-white">{d.name}</p>
                      <p className="font-mono text-[10px] text-white/35">
                        {d.route}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-[11px] leading-snug text-white/40">
                Every card here is detailed in the dashboard section below.
              </p>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.25}>
          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-white/50">
            Cadence: registries sync nightly, session tables twice daily, and
            Teampact lands around 02:00 with summaries recomputed straight
            after. In practice, the dashboards read yesterday&apos;s field work
            by breakfast; only mentor visits and the closure calendar are
            written live.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
