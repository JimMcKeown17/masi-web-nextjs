import { FadeUp } from "@/components/animations/FadeAnimations";
import { ROLE_META } from "@/lib/data-map/config";
import { Eyebrow, KeyBadge } from "./legend";

const CARDS = [
  {
    role: "canonical" as const,
    title: "Canonical entities",
    tagline: "The nouns.",
    body: "Children, youth, schools, staff. Each exists exactly once, with a permanent ID that never changes, however many apps, spreadsheets or years it appears in. These registries are small, precious and hand-maintained.",
    example: ["CH-00412", "SCH-00017", "YTH-0203"],
  },
  {
    role: "event" as const,
    title: "Events",
    tagline: "The verbs.",
    body: "A session taught. An assessment scored. A school visited. Events arrive by the thousands and are never edited after the fact; each one carries the IDs of the entities it happened to.",
    example: ["session -> CH-00412", "assessment -> CH-00412"],
  },
  {
    role: "derived" as const,
    title: "Derived data",
    tagline: "The answers.",
    body: "Summaries, caches and published stats computed from events. Machines rebuild them on a schedule; nobody edits them by hand. If a derived number looks wrong, the fix is upstream, in the entities or events.",
    example: ["school summary", "published stat"],
  },
];

export function MentalModel() {
  return (
    <section id="mental-model" className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp>
          <Eyebrow index="01" label="The mental model" />
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            Three kinds of data,
            <br />
            <span className="italic font-light text-[#E72D4D]">one rule.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <p className="mt-6 max-w-2xl text-gray-600 text-lg leading-relaxed">
            Think of a bank. It keeps one record per customer, and millions of
            transactions that each point at a customer. Nobody asks the
            transaction log who you are, and nobody asks your customer record
            what you spent on Tuesday. Masi runs the same way.
          </p>
        </FadeUp>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {CARDS.map((c, i) => (
            <FadeUp key={c.role} delay={0.1 * (i + 1)}>
              <div
                className="h-full rounded-lg border border-gray-200 bg-white p-6 border-t-4"
                style={{ borderTopColor: ROLE_META[c.role].light }}
              >
                <p
                  className="font-serif italic text-lg"
                  style={{ color: ROLE_META[c.role].light }}
                >
                  {c.tagline}
                </p>
                <h3 className="mt-1 font-serif text-2xl text-[#14181D]">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {c.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.example.map((e) => (
                    <KeyBadge key={e} id={e} />
                  ))}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.4}>
          <div className="mt-12 rounded-lg bg-[#14181D] px-6 py-8 md:px-10 md:py-10">
            <p className="text-sm tracking-[0.25em] uppercase text-white/50">
              The one rule
            </p>
            <p className="mt-3 font-serif text-2xl md:text-3xl leading-snug text-white max-w-3xl">
              Every event must name its entities.{" "}
              <span className="italic font-light text-[#EF4A66]">
                An event that cannot find its child is an orphan:
              </span>{" "}
              the work happened, but no child gets credit, no school total
              moves, no ring on the WIG board fills.
            </p>
            <p className="mt-4 text-white/70 max-w-3xl leading-relaxed">
              Orphan prevention is a management job, not a technical one. It
              means the people entering data keep IDs clean at the source,
              and someone owns each registry. That is what the stewardship
              register at the bottom of this page is for.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
