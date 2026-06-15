'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';
import CountUp from '@/components/animations/count-up';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export interface BandStat {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

interface StatBandV3Props {
  bg: string;            // band background color
  tagline: React.ReactNode;
  stats: BandStat[];     // big achievement numbers (count up)
  context?: string;      // optional "why it matters" framing line
  dataHref?: string;
}

export default function StatBandV3({ bg, tagline, stats, context, dataHref = '/impact/data-portal' }: StatBandV3Props) {
  return (
    <section className="text-white py-16 md:py-20" style={{ backgroundColor: bg }}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-start">
          {/* Left rail: tagline + context + data link */}
          <FadeUp className="md:col-span-4 space-y-6">
            <h3 style={serif} className="text-2xl md:text-3xl italic font-light leading-snug">
              {tagline}
            </h3>
            {context && (
              <p className="text-white/70 text-sm leading-relaxed border-l-2 border-white/30 pl-4">
                {context}
              </p>
            )}
            <a
              href={dataHref}
              className="inline-block text-sm font-medium text-white border-b border-white/50 pb-0.5 hover:border-white transition-colors"
            >
              Explore the data &rarr;
            </a>
          </FadeUp>

          {/* Stats */}
          <div className={`md:col-span-8 grid gap-10 md:gap-8 ${stats.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {stats.map((s, i) => (
              <FadeUp key={s.label} delay={0.1 * (i + 1)}>
                <div className="border-t border-white/25 pt-5 space-y-3">
                  <span style={serif} className="block">
                    <CountUp
                      to={s.to}
                      decimals={s.decimals}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      className="block text-5xl md:text-7xl font-medium"
                    />
                  </span>
                  <p className="text-white/85 text-base leading-relaxed max-w-[26ch]">{s.label}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
