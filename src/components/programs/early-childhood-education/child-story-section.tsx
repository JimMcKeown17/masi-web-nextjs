'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';
import ChildRadar from './child-radar';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// Luphawu's story, photo, and assessment data are used with a signed permission
// slip. Display her first name only (no surname). Her radar scores live in
// ./child-radar.tsx. Confirm the school caption ("Sifunimfundo ECD") if needed.
const CHILD = {
  name: 'Luphawu',
  caption: 'Sifunimfundo ECD',
  photo: '/images/Dyanti Luphawu - Sifunimfundo ECD.webp',
  story:
    'When Luphawu started with us, she knew just two letters and could not yet blend a single sound. We met her exactly where she was. Term by term, on her own level, she built one skill on top of the next, until she was reading on her own.',
  pullquote: 'From two letters to reading on her own.',
  deltas: [
    { label: 'Letters known', from: '2', to: '26' },
    { label: 'Words read per minute', from: '0', to: '40' },
  ],
};

export default function ChildStorySection() {
  return (
    <section className="bg-[#0E1116] text-white py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#E72D4D]" />
            <span className="text-sm tracking-[0.25em] uppercase text-white/60">One child&apos;s journey</span>
          </div>
          <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05]">
            Meet <span className="italic font-light text-[#E72D4D]">{CHILD.name}.</span>
          </h2>
        </FadeUp>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - portrait + story */}
          <FadeUp className="space-y-7">
            <div className="relative rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src={getImageUrl(CHILD.photo)}
                  alt={`${CHILD.name}, Early Childhood Education`}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                <p className="text-sm text-white/75">{CHILD.caption}</p>
              </div>
            </div>

            <p className="text-white/80 text-lg leading-relaxed">{CHILD.story}</p>

            <p style={serif} className="text-2xl md:text-3xl italic font-light leading-snug text-white">
              {CHILD.pullquote}
            </p>
          </FadeUp>

          {/* Right - growth radar in a dark panel */}
          <FadeLeft>
            <div className="rounded-lg bg-[#171C24] ring-1 ring-white/10 p-6 md:p-8">
              <p className="text-sm tracking-[0.2em] uppercase text-white/50 mb-2">Her literacy growth</p>
              <div className="flex items-center gap-6 mb-2 text-sm">
                <span className="inline-flex items-center gap-2 text-white/70">
                  <span className="w-3 h-3 rounded-sm border border-white/50 bg-white/10" /> At intake
                </span>
                <span className="inline-flex items-center gap-2 text-white/70">
                  <span className="w-3 h-3 rounded-sm border border-[#E72D4D] bg-[#E72D4D]/30" /> Today
                </span>
              </div>

              <ChildRadar />

              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-white/10 pt-6">
                {CHILD.deltas.map((d) => (
                  <div key={d.label}>
                    <span style={serif} className="block text-2xl md:text-3xl font-medium">
                      {d.from} <span className="text-white/40">&rarr;</span>{' '}
                      <span className="text-[#E72D4D]">{d.to}</span>
                    </span>
                    <p className="text-sm text-white/60 mt-1">{d.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}
