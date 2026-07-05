import { FadeUp } from "@/components/animations/FadeAnimations";
import { KEY_SYSTEM } from "@/lib/data-map/config";
import { Eyebrow } from "./legend";

// The ID system: the small set of keys that let any event find its entities,
// in either backend, in any year.

export function KeySpine() {
  return (
    <section id="spine" className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp>
          <Eyebrow index="05" label="The spine" />
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            Eight IDs hold it
            <span className="italic font-light text-[#E72D4D]"> together.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-gray-600 text-lg leading-relaxed">
            Every linkage on this page reduces to one of these keys. If a key
            is wrong at capture time, everything downstream of it is wrong
            too, which is why the registries that mint them deserve owners.
          </p>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="mt-12 rounded-lg border border-gray-200 overflow-hidden">
            <div className="hidden md:grid md:grid-cols-[0.8fr_1.3fr_0.9fr_1.4fr] gap-x-6 px-6 py-3 bg-gray-50 text-[11px] uppercase tracking-[0.2em] text-gray-400">
              <span>Key</span>
              <span>Identifies</span>
              <span>Minted by</span>
              <span>Used by</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {KEY_SYSTEM.map((k) => (
                <li
                  key={k.key}
                  className="px-6 py-4 grid gap-x-6 gap-y-1 md:grid-cols-[0.8fr_1.3fr_0.9fr_1.4fr] md:items-baseline"
                >
                  <code className="font-mono text-sm font-semibold text-[#14181D]">
                    {k.key}
                  </code>
                  <p className="text-sm text-gray-700">{k.identifies}</p>
                  <p className="text-xs text-gray-500">{k.mintedBy}</p>
                  <p className="text-xs leading-relaxed text-gray-500">
                    {k.usedBy}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>

        <FadeUp delay={0.25}>
          <div className="mt-10 max-w-3xl border-l-2 border-[#E72D4D] pl-6">
            <p className="text-gray-600 leading-relaxed">
              How the two backends agree on identity: the Masi backend
              publishes an identity feed mapping school and youth UIDs to the
              names Teampact uses, and each canonical child record stores its
              Teampact <code className="font-mono text-sm">participant_id</code>.
              That is the whole bridge. A child can appear in Airtable,
              Teampact and, soon, the mobile apps, and still be one child.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
