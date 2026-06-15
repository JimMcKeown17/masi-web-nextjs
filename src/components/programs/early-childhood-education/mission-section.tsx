'use client';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export default function MissionSection() {
  return (
    <section className="bg-[#FAF7F2] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left - Mission statement */}
          <FadeUp className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#E72D4D]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our mission</span>
            </div>

            <p style={serif} className="text-3xl md:text-4xl leading-[1.25] text-[#14181D]">
              Give every child the{' '}
              <span className="relative whitespace-nowrap">
                superpower of reading
                <span className="absolute left-0 -bottom-1 w-full h-[0.16em] bg-[#E72D4D]/70 rounded-full" />
              </span>
              , the confidence to prosper, and a lasting spirit of curiosity.
            </p>

            <p className="text-gray-600 text-lg leading-relaxed">
              We take a data-driven, systematic approach: teaching children step by
              step, at their own pace and on their own level, until they can read.
            </p>
          </FadeUp>

          {/* Right - Video */}
          <FadeLeft>
            <div className="relative rounded-lg overflow-hidden shadow-xl ring-1 ring-black/5">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/tj_W0jlFiPQ?si=jZsBVkX_TCUpidH8"
                  title="Masinyusane Early Childhood Education"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}
