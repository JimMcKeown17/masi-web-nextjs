'use client';
import { useRef } from 'react';
import { BookOpen, Blocks, Home } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { FadeUp } from '@/components/animations/FadeAnimations';
import CountUp from '@/components/animations/count-up';

// Ring that fills to `percentage` on scroll, paired with a counting number.
function CircularProgress({ percentage, icon: Icon }: { percentage: number; icon: React.ElementType }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const target = circumference - (percentage / 100) * circumference;

  return (
    <div ref={ref} className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#EAE4D8" strokeWidth="10" />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#C81E3C"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: target } : {}}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-8 h-8 md:w-10 md:h-10 text-[#C81E3C]" />
      </div>
    </div>
  );
}

function StatCard({ percentage, icon, description }: { percentage: number; icon: React.ElementType; description: string }) {
  return (
    <div className="flex items-center gap-5">
      <CircularProgress percentage={percentage} icon={icon} />
      <div>
        <span className="font-serif block text-5xl md:text-6xl font-medium text-[#C81E3C]">
          <CountUp to={percentage} suffix="%" />
        </span>
        <p className="text-sm md:text-base text-gray-600 max-w-[200px] mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function ProblemSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-4xl mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#C81E3C]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">The education crisis</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            81% of ten-year-olds in South Africa{' '}
            <span className="italic font-light text-[#C81E3C]">cannot read.</span>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <FadeUp delay={0.05}>
            <StatCard percentage={81} icon={BookOpen} description="of South African children cannot read for meaning" />
          </FadeUp>
          <FadeUp delay={0.1}>
            <StatCard percentage={75} icon={Blocks} description="do not receive any preschool education" />
          </FadeUp>
          <FadeUp delay={0.15}>
            <StatCard percentage={56} icon={Home} description="of South African homes have no books" />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
