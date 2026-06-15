'use client';
import { getAssetUrl } from '@/lib/imageUrl';
import { FadeUp } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export default function DonateCtaV3() {
  return (
    <section className="bg-[#C81E3C] text-white py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <FadeUp>
          <h2 style={serif} className="text-4xl md:text-6xl leading-[1.1] mb-6">
            Help a child learn to read
            <br />
            <span className="italic font-light relative inline-block">
              this year.
              <span className="absolute left-0 -bottom-1 w-full h-[0.12em] bg-white/50 rounded-full" />
            </span>
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-white/85 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Your donation hires and trains a local woman to teach literacy in her own
            community, and we&apos;ll show you the data to prove it&apos;s working.
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <a
              href="/donate"
              className="bg-white text-[#C81E3C] hover:bg-white/90 px-10 py-4 rounded-md font-semibold text-lg transition-colors"
            >
              Donate
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
