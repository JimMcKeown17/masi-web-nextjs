'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export default function MissionV3() {
  return (
    <section className="bg-[#FAF7F2] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl">
          <FadeUp>
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-10 bg-[#E72D4D]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our mission</span>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <p style={serif} className="text-3xl md:text-5xl leading-[1.25] text-[#14181D] mb-10">
              We create opportunities for South Africa&apos;s children and youth to get the{' '}
              <span className="relative whitespace-nowrap">
                best education possible
                <span className="absolute left-0 -bottom-1 w-full h-[0.18em] bg-[#E72D4D]/70 rounded-full" />
              </span>
              , by investing in the communities that raise them.
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              <p className="text-gray-600 text-lg leading-relaxed">
                Every programme creates jobs for local women and youth, so a generation
                of leaders is built now while we invest in the long-term future of
                South Africa&apos;s children.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                And because we measure everything, you never have to take our word
                for it.{' '}
                <a href="/impact/data-portal" className="text-[#E72D4D] font-medium hover:underline underline-offset-4">
                  See the data &rarr;
                </a>
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
