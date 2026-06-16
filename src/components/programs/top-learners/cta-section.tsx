'use client';
import { getAssetUrl } from '@/lib/imageUrl';
import { FadeUp } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// Closing call to action. Deep-ink panel so the gold reads as warm and celebratory;
// gold-on-dark uses the lifted #E2B53C for the accent word and underline.
export default function CtaSection() {
  return (
    <section className="bg-[#0E1116] text-white py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <FadeUp>
          <h2 style={serif} className="text-4xl md:text-6xl leading-[1.1] mb-6">
            Send the next one
            <br />
            <span className="italic font-light relative inline-block text-[#E2B53C]">
              to university.
              <span className="absolute left-0 -bottom-1 w-full h-[0.1em] bg-[#E2B53C]/50 rounded-full" />
            </span>
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Your gift covers tuition, food, transport, mentoring, and a safe place to live,
            everything a brilliant young person needs to become a graduate. And we will show
            you the data that proves it works.
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <a
              href="/donate"
              className="bg-[#B8860B] text-white hover:bg-[#9a7009] px-10 py-4 rounded-md font-semibold text-lg transition-colors"
            >
              Support the Fund
            </a>
            <a
              href={getAssetUrl('reports/Masinyusane Annual Report 2024 (R).pdf')}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/60 hover:bg-white/10 px-8 py-4 rounded-md font-medium text-lg transition-colors"
            >
              Read the Annual Report
            </a>
          </div>
        </FadeUp>
        <FadeUp delay={0.3}>
          <p className="text-white/60 text-sm tracking-wide">
            Registered South African NPO 074-244 &middot; US 501(c)(3) 27-3024837 &middot; Candid Platinum Transparency 2024
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
