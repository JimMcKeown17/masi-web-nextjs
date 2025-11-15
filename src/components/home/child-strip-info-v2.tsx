'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';

export default function ChildStripInfoV2() {
  return (
    <section className="bg-red-600/90 text-white pt-12 md:pt-16 pb-16 md:pb-20">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <FadeUp>
          <h3 className="text-xl md:text-2xl font-light mb-12 text-center md:text-left">
            Where every child discovers <span className="italic">the power of words.</span>
          </h3>
        </FadeUp>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <FadeUp delay={0.1}>
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-extrabold">2x</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                Children on the program learn to read twice as fast as children that are not.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-extrabold">400%</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                Preschool children drastically outperform control groups on literacy basics tests.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="space-y-3 pb-4">
              <h2 className="text-6xl md:text-7xl font-extrabold">18,756</h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                Children are participating in our literacy & reading projects in 2024.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

