'use client';
import { Briefcase, DollarSign, BookOpen, Sparkles } from 'lucide-react';
import { FadeUp } from '@/components/animations/FadeAnimations';

function BenefitCard({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="w-16 h-16 rounded-full bg-white/5 ring-1 ring-white/15 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-[#5B9BFF]" strokeWidth={2} />
      </div>
      <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-[240px]">{text}</p>
    </div>
  );
}

export default function SolutionDetails() {
  return (
    <section className="py-24 md:py-32 bg-[#14181D]">
      <div className="container mx-auto px-4 text-center">
        <FadeUp>
          <div className="inline-flex items-center gap-3 mb-7">
            <span className="h-px w-10 bg-[#5B9BFF]" />
            <span className="text-sm tracking-[0.25em] uppercase text-white/60">Two birds, one stone</span>
            <span className="h-px w-10 bg-[#5B9BFF]" />
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2 className="font-serif text-5xl md:text-7xl font-semibold text-white leading-[1.05] mb-6">
            Two crises. <span className="italic font-light text-[#5B9BFF]">One solution.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="text-white/75 text-lg md:text-xl max-w-3xl mx-auto mb-16 md:mb-20 leading-relaxed">
            We hire unemployed women and train them as reading and numeracy coaches in
            schools and preschools. One hire solves two problems at once.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 max-w-6xl mx-auto">
          <FadeUp delay={0.1}>
            <BenefitCard icon={Briefcase} text="Women enter their first jobs, gaining skills and income." />
          </FadeUp>
          <FadeUp delay={0.15}>
            <BenefitCard icon={DollarSign} text="Their families have an income, often for the first time." />
          </FadeUp>
          <FadeUp delay={0.2}>
            <BenefitCard icon={BookOpen} text="Children learn to read and write, unlocking all future learning." />
          </FadeUp>
          <FadeUp delay={0.25}>
            <BenefitCard icon={Sparkles} text="By age seven, each child has heard 1,000 stories, building vocabulary and imagination." />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
