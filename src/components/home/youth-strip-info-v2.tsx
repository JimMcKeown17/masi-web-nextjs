'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';

export default function YouthStripInfoV2() {
  return (
    <section className="bg-blue-600/90 text-white pt-12 md:pt-16 pb-16 md:pb-20">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <FadeUp>
          <h3 className="text-xl md:text-2xl font-light mb-12 text-center md:text-left">
            Empowering a community to <span className="italic">uplift itself.</span>
          </h3>
        </FadeUp>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          <FadeUp delay={0.1}>
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-extrabold">92%</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                of our jobs go to women.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-extrabold">1964</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                Previously unemployed youth have received jobs
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-extrabold">43%</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                Highest youth unemployment rate in the world.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.4}>
            <div className="space-y-3 pb-4">
              <h2 className="text-6xl md:text-7xl font-extrabold">75%</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                of South Africans are unemployed.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}


