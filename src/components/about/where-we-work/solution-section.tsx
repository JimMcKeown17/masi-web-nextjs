'use client';
import { Globe, Coins, Users } from 'lucide-react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import CountUp from '@/components/animations/count-up';

function StatCard({
  icon: Icon,
  display,
  to,
  suffix,
  description,
}: {
  icon: React.ElementType;
  display?: string;
  to?: number;
  suffix?: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#C81E3C]/10 flex items-center justify-center">
        <Icon className="w-8 h-8 md:w-9 md:h-9 text-[#C81E3C]" />
      </div>
      <div>
        <span className="font-serif block text-4xl md:text-6xl font-medium text-[#C81E3C]">
          {display ?? <CountUp to={to ?? 0} suffix={suffix} />}
        </span>
        <p className="text-sm md:text-base text-gray-600 max-w-[210px] mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function SolutionSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FAF7F2]">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-4xl mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#C81E3C]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">The unemployment crisis</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            Meanwhile, South Africa has the world&apos;s highest{' '}
            <span className="italic font-light text-[#C81E3C]">unemployment rate.</span>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <FadeUp delay={0.05}>
            <StatCard icon={Globe} display="#1" description="unemployment rate in the world" />
          </FadeUp>
          <FadeUp delay={0.1}>
            <StatCard icon={Coins} to={23} suffix="m" description="South Africans live on less than $2 a day" />
          </FadeUp>
          <FadeUp delay={0.15}>
            <StatCard icon={Users} to={75} suffix="%" description="of the unemployed are youth" />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
