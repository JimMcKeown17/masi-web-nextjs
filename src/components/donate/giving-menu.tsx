'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';
import { PROGRAMMES } from './gifts';
import GiftCard from './gift-card';
import FeatureGift from './feature-gift';

export default function GivingMenu() {
  return (
    <>
      {PROGRAMMES.map((p) => (
        <section key={p.key} className="py-16 md:py-24" style={{ backgroundColor: p.background }}>
          <div className="container mx-auto px-4">
            <FadeUp className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="font-serif text-sm italic" style={{ color: p.accent }}>{p.index}</span>
                <span className="h-px w-8" style={{ backgroundColor: p.accent }} />
                <span className="text-xs uppercase tracking-[0.25em] text-gray-500">{p.label}</span>
              </div>
              <h2 className="font-serif text-3xl leading-[1.05] text-[#14181D] md:text-5xl">
                {p.headline.lead}
                <span className="font-light italic" style={{ color: p.accent }}>{p.headline.accent}</span>
                {p.headline.tail}
              </h2>
              <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-gray-600">{p.sub}</p>
            </FadeUp>

            <FadeUp className="mt-8 md:mt-10">
              {p.layout === 'row' ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {p.gifts.map((g) => <GiftCard key={g.id} gift={g} accent={p.accent} />)}
                </div>
              ) : (
                <FeatureGift gift={p.gifts[0]} accent={p.accent} image={p.image!} reversed={p.layout === 'feature-rev'} />
              )}
            </FadeUp>
          </div>
        </section>
      ))}
    </>
  );
}
