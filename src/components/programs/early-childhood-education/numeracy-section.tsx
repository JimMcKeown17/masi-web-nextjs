'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeUp, FadeRight } from '@/components/animations/FadeAnimations';
import CountUp from '@/components/animations/count-up';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export default function NumeracySection() {
  return (
    <section className="bg-[#FAF7F2] py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Text */}
          <FadeUp className="space-y-6 lg:order-2">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#C81E3C]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Mathematics</span>
            </div>

            <h2 style={serif} className="text-4xl md:text-5xl leading-[1.08] text-[#14181D]">
              Numeracy
              <br />
              <span className="italic font-light text-[#C81E3C]">fundamentals.</span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed">
              With children aged 3 to 6, we teach the fundamentals of mathematics.
              Strong numerical foundations early give children confidence with numbers,
              problem-solving skills, and the logical thinking that serves them throughout
              their education.
            </p>

            {/* Source: impact overview page (numeracy scores roughly doubling, 24.6 to 49.6 in a year). Verify before shipping. */}
            <div className="pt-2">
              <span style={serif} className="block text-3xl md:text-4xl font-medium text-[#C81E3C]">
                <CountUp to={24.6} decimals={1} /> <span className="text-gray-300">&rarr;</span>{' '}
                <CountUp to={49.6} decimals={1} />
              </span>
              <p className="text-sm text-gray-500 mt-1 max-w-[26ch]">
                average numeracy score, roughly doubling in a single year
              </p>
            </div>
          </FadeUp>

          {/* Photo */}
          <FadeRight className="lg:order-1">
            <div className="relative rounded-lg overflow-hidden shadow-xl ring-1 ring-black/5">
              <div className="relative aspect-[16/11]">
                <Image
                  src={getImageUrl('/images/Child Numeracy.jpg')}
                  alt="A child working on numeracy"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </FadeRight>
        </div>
      </div>
    </section>
  );
}
