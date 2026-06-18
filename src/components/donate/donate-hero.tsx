import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import CountUp from '@/components/animations/count-up';

// PLACEHOLDER photo: swap for the strongest donate hero image.
const HERO_IMAGE = 'images/Strip - Child.jpg';

// Audited stats carried from the old page. FACT-CHECK against the data portal
// before merge (design-system rule).
const STATS = [
  { to: 18276, suffix: '', label: 'Children' },
  { to: 364, suffix: '', label: 'Community jobs' },
  { to: 154, suffix: '', label: 'Schools' },
  { to: 100, suffix: '+', label: 'University scholars' },
];

export default function DonateHero() {
  return (
    <section className="grid md:grid-cols-2">
      <div className="flex flex-col justify-center bg-[#0E1116] px-6 py-16 md:px-12 md:py-24">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-10 bg-[#E72D4D]" />
          <span className="text-xs uppercase tracking-[0.25em] text-white/80">Support our work</span>
        </div>
        <h1 className="font-serif text-4xl font-medium leading-[1.04] text-white md:text-6xl">
          Every child reading.<br />
          Every youth <span className="font-light italic text-[#E72D4D]">working.</span>
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/80">
          Choose what your gift builds. Every figure on this page is an audited cost, not a marketing round number.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <CountUp to={s.to} suffix={s.suffix} className="block font-serif text-2xl font-medium text-white md:text-3xl" />
              <span className="mt-1 block text-[11px] uppercase tracking-[0.04em] text-white/60">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-7 max-w-lg border-t border-white/10 pt-4 text-[13px] leading-relaxed text-white/55">
          Every supporter receives <span className="text-white/85">monthly progress reports from the programme they back</span>: results, photos, and stories from the field. Programme-wide updates, not individual-child reports.
        </p>
      </div>
      <div className="relative min-h-[320px] md:min-h-0">
        <Image src={getImageUrl(HERO_IMAGE)} alt="A child learning to read with Masinyusane" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
    </section>
  );
}
