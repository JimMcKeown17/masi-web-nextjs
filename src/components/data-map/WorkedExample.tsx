import { FadeUp } from "@/components/animations/FadeAnimations";
import { ROLE_META } from "@/lib/data-map/config";
import { Eyebrow } from "./legend";

// One worked example, end to end: three registries stamp their keys onto one
// session row, the API aggregates rows, the dashboard draws the chart.
// All names, IDs and bar heights below are ILLUSTRATIVE, not real records.

const CANONICAL = ROLE_META.canonical;
const EVENT = ROLE_META.event;
const DERIVED = ROLE_META.derived;

// An entity ID chip whose colour ties it back to the canonical registries.
function EntityKey({ id }: { id: string }) {
  return (
    <code
      className="inline-block rounded border px-1.5 py-0.5 font-mono text-[11px] leading-none tracking-tight"
      style={{
        borderColor: `${CANONICAL.light}55`,
        backgroundColor: `${CANONICAL.light}0D`,
        color: CANONICAL.deep,
      }}
    >
      {id}
    </code>
  );
}

function DownArrow() {
  return (
    <svg width="24" height="34" viewBox="0 0 24 34" fill="none" aria-hidden>
      <path d="M12 2v22" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 22l6 8 6-8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function RegistryCard({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; id: string }[];
}) {
  return (
    <div
      className="h-full rounded-lg border border-gray-200 bg-white p-4 border-t-4"
      style={{ borderTopColor: CANONICAL.light }}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-[0.18em]"
        style={{ color: CANONICAL.deep }}
      >
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2">
            <span className="text-sm text-[#14181D]">{r.name}</span>
            <EntityKey id={r.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// The session row, rendered like a database record with its keys visible.
const ROW_FIELDS: { label: string; value: string; isKey?: boolean }[] = [
  { label: "session_uid", value: "LS-2026-18342" },
  { label: "session_date", value: "2026-06-30" },
  { label: "youth_uid", value: "YTH-0203", isKey: true },
  { label: "school_uid", value: "SCH-00017", isKey: true },
  { label: "child_uid_1", value: "CH-00412", isKey: true },
  { label: "child_uid_2", value: "CH-00517", isKey: true },
  { label: "letters_taught", value: "s, a, n" },
];

// Illustrative sessions-per-day bars for the mini chart (Mon to Fri).
const WEEK = [
  { day: "Mon", n: 2 },
  { day: "Tue", n: 3 },
  { day: "Wed", n: 1 },
  { day: "Thu", n: 2 },
  { day: "Fri", n: 1 },
];

function MiniChart() {
  const max = 3;
  const barW = 28;
  const gap = 22;
  const chartH = 72;
  const width = WEEK.length * barW + (WEEK.length - 1) * gap;
  return (
    <svg
      width={width}
      height={chartH + 22}
      viewBox={`0 0 ${width} ${chartH + 22}`}
      className="max-w-full"
      role="img"
      aria-label="Illustrative bar chart: sessions per day, Monday to Friday"
    >
      {WEEK.map((d, i) => {
        const h = (d.n / max) * chartH;
        const x = i * (barW + gap);
        return (
          <g key={d.day}>
            <rect
              x={x}
              y={chartH - h}
              width={barW}
              height={h}
              rx={3}
              fill={CANONICAL.dark}
            />
            <text
              x={x + barW / 2}
              y={chartH + 16}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(255,255,255,0.5)"
            >
              {d.day}
            </text>
          </g>
        );
      })}
      <line x1={0} y1={chartH + 0.5} x2={width} y2={chartH + 0.5} stroke="rgba(255,255,255,0.2)" />
    </svg>
  );
}

export function WorkedExample() {
  return (
    <section id="example" className="bg-[#FAF7F2] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp>
          <Eyebrow index="02" label="A worked example" />
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            Follow one
            <span className="italic font-light text-[#E72D4D]"> session.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-gray-600 text-lg leading-relaxed">
            Tuesday, 09:40. A literacy coach sits down with two Grade 1
            children for twenty minutes of paired reading. Here is everything
            that happens to that one fact on its way to a chart.
          </p>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="mt-12 max-w-4xl mx-auto">
            {/* Step 1: the three registries that must already know everyone */}
            <p className="text-xs text-gray-500 mb-3">
              <span className="font-serif italic text-[#E72D4D]">1 · </span>
              The people and the place already exist, exactly once, in the
              canonical registries.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <RegistryCard
                title="Children registry"
                rows={[
                  { name: "Amahle M.", id: "CH-00412" },
                  { name: "Sipho N.", id: "CH-00517" },
                ]}
              />
              <RegistryCard
                title="Schools registry"
                rows={[{ name: "Emsengeni Primary", id: "SCH-00017" }]}
              />
              <RegistryCard
                title="Youth roster"
                rows={[{ name: "Nolusindiso D. (coach)", id: "YTH-0203" }]}
              />
            </div>

            {/* Converging arrows: each registry stamps its key onto the row */}
            <div className="hidden md:grid md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex justify-center">
                  <DownArrow />
                </div>
              ))}
            </div>
            <div className="flex md:hidden justify-center">
              <DownArrow />
            </div>

            {/* Step 2: the event row carrying all three keys */}
            <p className="text-xs text-gray-500 mb-3">
              <span className="font-serif italic text-[#E72D4D]">2 · </span>
              The coach logs the session in Airtable; the twice-daily sync
              writes one row that names all three by ID.
            </p>
            <div
              className="rounded-lg border border-gray-200 bg-white border-l-4"
              style={{ borderLeftColor: EVENT.light }}
            >
              <div
                className="px-5 py-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] border-b border-gray-100"
                style={{ color: EVENT.deep }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: EVENT.light }}
                  aria-hidden
                />
                One row in literacy_sessions_2026
              </div>
              <div className="px-5 py-4 flex flex-wrap gap-x-7 gap-y-3">
                {ROW_FIELDS.map((f) => (
                  <div key={f.label}>
                    <p className="font-mono text-[10px] text-gray-400">
                      {f.label}
                    </p>
                    {f.isKey ? (
                      <EntityKey id={f.value} />
                    ) : (
                      <p className="font-mono text-[12px] text-[#14181D]">
                        {f.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <DownArrow />
            </div>

            {/* Step 3: aggregation in the serving layer */}
            <p className="text-xs text-gray-500 mb-3 text-center">
              <span className="font-serif italic text-[#E72D4D]">3 · </span>
              The Masi API counts rows per coach per working day, skipping
              closure days from the calendar.
            </p>
            <div className="flex justify-center">
              <div
                className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2"
                style={{ borderColor: `${DERIVED.light}55` }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: DERIVED.light }}
                  aria-hidden
                />
                <code className="font-mono text-xs" style={{ color: DERIVED.deep }}>
                  GET /youth-sessions/daily-activity/
                </code>
              </div>
            </div>

            <div className="flex justify-center">
              <DownArrow />
            </div>

            {/* Step 4: the chart leadership reads */}
            <p className="text-xs text-gray-500 mb-3 text-center">
              <span className="font-serif italic text-[#E72D4D]">4 · </span>
              Tuesday's bar on the Youth Sessions dashboard grows by one.
            </p>
            <div className="rounded-lg bg-[#0E1116] px-6 py-6 md:px-8">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                    Youth Sessions dashboard
                  </p>
                  <p className="mt-1 font-serif text-xl text-white">
                    Nolusindiso&apos;s week
                  </p>
                  <p className="mt-2 max-w-[36ch] text-xs leading-relaxed text-white/60">
                    The same rows also feed her school&apos;s coverage grid and
                    the WIG sessions-per-day ring.
                  </p>
                  <code className="mt-3 block font-mono text-[10px] text-white/35">
                    /operations/youth-sessions
                  </code>
                </div>
                <MiniChart />
              </div>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-gray-500 max-w-3xl">
              Names, IDs and bar heights above are illustrative. The chain is
              real, and it is fragile in exactly one place: if a key on the
              row is mistyped at capture, the session still syncs but falls
              out of every count downstream. The work happened; the data
              says it did not. That is why each registry has a steward.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
