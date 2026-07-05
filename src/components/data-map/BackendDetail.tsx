import { FadeUp } from "@/components/animations/FadeAnimations";
import {
  AS_OF,
  BackendSpec,
  MASI_BACKEND,
  Role,
  ROLE_META,
  ZAZI_BACKEND,
} from "@/lib/data-map/config";
import { Eyebrow, KeyBadge } from "./legend";

// Ledger-style register of what actually lives in each backend, grouped by
// role. Table-like rows on desktop, stacked cards on mobile.

const ROLE_ORDER: Role[] = ["canonical", "event", "derived"];

function DatasetLedger({ backend }: { backend: BackendSpec }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-5 md:px-7 md:py-6 border-b border-gray-200">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h3 className="font-serif text-2xl md:text-3xl text-[#14181D]">
            {backend.name}
          </h3>
          <code className="font-mono text-xs text-gray-400">
            {backend.db} · {backend.stack}
          </code>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
          {backend.intro}
        </p>
      </div>

      {ROLE_ORDER.map((role) => {
        const rows = backend.datasets.filter((d) => d.role === role);
        if (rows.length === 0) return null;
        return (
          <div key={role}>
            <div
              className="px-5 md:px-7 py-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em]"
              style={{
                backgroundColor: `${ROLE_META[role].light}14`,
                color: ROLE_META[role].deep,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: ROLE_META[role].light }}
                aria-hidden
              />
              {ROLE_META[role].plural}
            </div>
            <ul className="divide-y divide-gray-100">
              {rows.map((d) => (
                <li
                  key={d.name}
                  className="px-5 md:px-7 py-4 grid gap-x-6 gap-y-1.5 md:grid-cols-[1.1fr_1fr_1.5fr_0.6fr] md:items-baseline"
                >
                  <div>
                    <p className="text-sm font-medium text-[#14181D]">
                      {d.name}
                    </p>
                    <code className="font-mono text-[11px] text-gray-400 break-words">
                      {d.table}
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {d.keys.length > 0 ? (
                      d.keys.map((k) => <KeyBadge key={k} id={k} />)
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">
                        no entity keys: derived
                      </span>
                    )}
                  </div>
                  <div className="text-xs leading-relaxed text-gray-600">
                    {d.grain && (
                      <p>
                        <span className="text-gray-400">one row = </span>
                        {d.grain}
                      </p>
                    )}
                    <p>{d.source}</p>
                  </div>
                  <p className="font-serif text-sm text-gray-500 md:text-right">
                    {d.scale ?? ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="px-5 md:px-7 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-xs leading-relaxed text-gray-500">
          {backend.legacyNote}
        </p>
      </div>
    </div>
  );
}

export function BackendDetail() {
  return (
    <section id="stores" className="bg-[#FAF7F2] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp>
          <Eyebrow index="04" label="Inside the stores" />
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            Two backends,
            <br />
            <span className="italic font-light text-[#E72D4D]">
              one discipline.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-gray-600 text-lg leading-relaxed">
            Both stores follow the same pattern: canonical registries, event
            tables that reference them by ID, and derived layers rebuilt by
            machines. Scale figures are as of {AS_OF} and grow daily.
          </p>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="mt-12">
            <DatasetLedger backend={MASI_BACKEND} />
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="mt-10">
            <DatasetLedger backend={ZAZI_BACKEND} />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
