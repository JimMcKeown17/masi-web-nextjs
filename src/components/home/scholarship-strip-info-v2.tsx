'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';

export default function ScholarshipStripInfoV2() {
  return (
    <section className="bg-yellow-600/90 text-white pt-12 md:pt-16 pb-16 md:pb-20">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <FadeUp>
          <h3 className="text-xl md:text-2xl font-light mb-12 text-center md:text-left">
            Investing in a generation of <span className="italic">future leaders.</span>
          </h3>
        </FadeUp>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          <FadeUp delay={0.1}>
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-extrabold">10,000+</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                High school learners assisted
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-extrabold">88%</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                Pass-rate
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-extrabold">259</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                Employed graduates
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.4}>
            <div className="space-y-3 pb-4">
              <h2 className="text-6xl md:text-7xl font-extrabold">1,000</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                University graduates by 2028
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
