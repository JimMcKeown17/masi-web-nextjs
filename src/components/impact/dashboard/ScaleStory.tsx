import { Kicker, Section } from "./Section";
import { ScaleMap } from "./ScaleMap";

// Lifted blue: the Community Jobs accent (#1D4ED8) tuned up for the deep-ink surface.
const ACCENT = "#5B8DEF";

const MILESTONES = [
  { year: "2008 · Founded", body: "Gqeberha (Port Elizabeth). University scholarships for township youth begin." },
  {
    year: "2015 · The jobs model",
    body: "Local youth become the workforce: education delivery and youth employment merge into one model. (milestone to be confirmed)",
  },
  {
    year: "2023 · Zazi iZandi and the data system",
    body: "12 schools, 52 youth, 1,897 children. Daily session logging and formal EGRA measurement begin.",
  },
  {
    year: "2025 · Scale",
    body: "100+ schools, 500+ youth, three languages. East London launch; 16 ECD centres; government TA partnership.",
  },
  {
    year: "2026 · Provincial partner",
    body: "Feature partner to the Eastern Cape DoE, with live data across every session, assessment and mentor visit.",
  },
];

export function ScaleStory() {
  return (
    <Section className="bg-[#0E1116] text-white">
      <Kicker accent={ACCENT} dark>
        Chapter 05 &middot; The model
      </Kicker>
      <h2 className="font-serif text-3xl font-medium tracking-tight md:text-[40px]">
        Eighteen years in the <span className="font-light italic text-[#5B8DEF]">same communities.</span>
      </h2>
      <p className="mt-3.5 max-w-[560px] text-[17px] leading-relaxed text-gray-400">
        Masinyusane hires and trains unemployed young people from the same communities as the schools, turning an
        education programme into a jobs programme, and a jobs programme into measurable learning.
      </p>
      <div className="mt-12 flex flex-col gap-10 lg:flex-row">
        <div className="relative min-h-[340px] flex-[1.3] overflow-hidden rounded-2xl border border-white/10 bg-[#0c1018]">
          {/* Real site map on desktop */}
          <div className="absolute inset-0 hidden md:block">
            <ScaleMap />
          </div>
          {/* Mobile fallback: MapLibre is heavy on phones */}
          <div
            className="flex h-full min-h-[340px] flex-col justify-center gap-2 px-6 md:hidden"
            style={{ backgroundImage: "radial-gradient(ellipse at 30% 70%, rgba(29,78,216,0.18), transparent 60%)" }}
          >
            <span className="font-serif text-5xl font-medium text-[#5B8DEF]">150+</span>
            <span className="text-sm text-gray-400">
              Masinyusane sites across the Eastern Cape, from Gqeberha to East London.
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-3.5 left-4 z-10 hidden rounded bg-[#0E1116]/70 px-2 py-1 text-xs text-gray-300 md:block">
            Every Masinyusane site, live from the schools database
          </div>
        </div>
        <div className="flex-1">
          {MILESTONES.map((milestone, index) => (
            <div key={milestone.year} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
                {index < MILESTONES.length - 1 && <span className="w-0.5 flex-1 bg-white/10" />}
              </div>
              <div className="pb-6">
                <div className="text-sm font-bold text-white">{milestone.year}</div>
                <p className="mt-1 max-w-[330px] text-[13.5px] leading-relaxed text-gray-400">{milestone.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
