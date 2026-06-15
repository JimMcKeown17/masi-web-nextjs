'use client';
import { ArrowRight } from 'lucide-react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import CountUp from '@/components/animations/count-up';
import RadarChartV3 from './radar-chart-v3';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

function DashboardCard() {
  return (
    <div className="rounded-xl bg-[#171C24] border border-white/10 shadow-2xl overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="mb-2">
          <p className="text-white/90 font-medium">Literacy skill profile</p>
          <p className="text-white/40 text-xs mt-0.5">Programme children vs control group &middot; seven core skills</p>
        </div>

        <RadarChartV3 />

        <div className="flex items-center gap-5 text-xs text-white/60 border-t border-white/10 pt-5 mt-2">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E72D4D]" /> On programme
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-white/20" /> Control group
          </span>
          <span className="ml-auto">
            <CountUp to={18756} className="text-white font-semibold" /> children tracked
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DataPortalV3() {
  return (
    <section className="bg-[#0E1116] py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 text-white space-y-7">
            <FadeUp>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[#E72D4D]" />
                <span className="text-sm tracking-[0.25em] uppercase text-white/60">Our impact</span>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05]">
                We measure
                <br />
                <span className="italic font-light text-[#E72D4D]">what matters.</span>
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Dozens of metrics per child, assessed in real time, so every
                intervention meets each child exactly where they are. Our entire
                dataset is open to funders, schools, and you.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <a
                href="/impact/data-portal"
                className="group inline-flex items-center gap-3 bg-[#E72D4D] hover:bg-[#c91f3d] text-white px-8 py-4 rounded-md font-semibold transition-colors"
              >
                Enter the Data Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </FadeUp>
          </div>

          <div className="lg:col-span-7">
            <DashboardCard />
          </div>
        </div>
      </div>
    </section>
  );
}
