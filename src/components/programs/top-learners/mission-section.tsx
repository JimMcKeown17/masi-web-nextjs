'use client';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// Mission: the signature Masi house line, in full editorial form, paired with the
// film. Accent: gold #B8860B. The "500 / 500 / 500" framing is lifted from the 2025
// Graduate Magazine; verify the running total against the data portal before each ship.
export default function MissionSection() {
  return (
    <section className="bg-[#FAF7F2] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left - Mission statement */}
          <FadeUp className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#B8860B]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our mission</span>
            </div>

            <p style={serif} className="text-3xl md:text-[2.6rem] leading-[1.2] text-[#14181D]">
              What happens when you flood a township with{' '}
              <span className="relative whitespace-nowrap">
                graduates
                <span className="absolute left-0 -bottom-1 w-full h-[0.14em] bg-[#B8860B]/70 rounded-full" />
              </span>
              ? We are going to find out.
            </p>

            <p className="text-gray-600 text-lg leading-relaxed">
              Every graduate is a cycle of poverty broken. 505 lives changed. 505 families
              lifted. A generation of young leaders returning to uplift their own families,
              solve their own communities&apos; problems, and show the next child exactly
              what is possible.
            </p>
          </FadeUp>

          {/* Right - Video */}
          <FadeLeft>
            <div className="relative rounded-lg overflow-hidden shadow-xl ring-1 ring-black/5">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/Yg3elIFqDS8"
                  title="Masinyusane Scholarship Fund"
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
