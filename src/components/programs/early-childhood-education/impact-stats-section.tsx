'use client';
import { useState, useEffect, useRef } from 'react';

interface StatData {
  target: number;
  label: string;
  suffix?: string;
}

const stats: StatData[] = [
  { target: 18276, label: 'Children Benefitting' },
  { target: 364, label: 'Community Jobs in 2024' },
  { target: 124, label: 'Improvement vs Control Group', suffix: '%' },
  { target: 154, label: 'Schools We Work In' }
];

function CounterStat({ target, label, suffix = '' }: StatData) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const statRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statRef.current) {
      observer.observe(statRef.current);
    }

    return () => {
      if (statRef.current) {
        observer.unobserve(statRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <div ref={statRef} className="text-center">
      <h2 className="text-5xl md:text-6xl font-bold mb-2">
        {count.toLocaleString()}{suffix}
      </h2>
      <p className="text-lg md:text-xl opacity-90">
        {label}
      </p>
    </div>
  );
}

export default function ImpactStatsSection() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-600 via-blue-700 to-rose-600 text-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          {/* Left - Title */}
          <div className="md:col-span-4">
            <h2 className="text-5xl md:text-6xl font-bold">
              Impact <span className="font-light">Stats</span>
            </h2>
          </div>

          {/* Right - Stats Grid */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <CounterStat
                  key={index}
                  target={stat.target}
                  label={stat.label}
                  suffix={stat.suffix}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

