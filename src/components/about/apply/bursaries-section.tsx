'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { GraduationCap, Lock } from 'lucide-react';
import { FadeUp } from '@/components/animations/FadeAnimations';

const bursaries = [
  {
    id: 1,
    title: 'Masi Scholarship',
    description: 'Funding opportunities for university students.',
    image: 'images/Graduates/Graduate - Sinazo.webp',
    applyUrl: '#',
    status: 'closed',
  },
  {
    id: 2,
    title: 'Kouga Bursaries',
    description: 'Bursaries for students in the Kouga Kamma Municipality.',
    image: 'images/Graduates/Graduate - Aviwe.webp',
    applyUrl: '#',
    status: 'closed',
  },
  {
    id: 3,
    title: 'Tsitsikamma Bursaries',
    description: 'Bursaries for students in the Tsitsikamma communities.',
    image: 'images/Graduates/Graduate - Sinazo Mpofu.webp',
    applyUrl: '#',
    status: 'closed',
  },
];

export default function BursariesSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FAF7F2]">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#B8860B]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Educational support</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            Bursaries &amp; <span className="italic font-light text-[#B8860B]">Scholarships</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mt-5 max-w-xl">
            Financial support for students pursuing higher education.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {bursaries.map((bursary, i) => (
            <FadeUp key={bursary.id} delay={0.08 * (i + 1)}>
              <div className="group h-full flex flex-col rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={getImageUrl(bursary.image)}
                    alt={bursary.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow">
                    <GraduationCap className="w-5 h-5 text-[#B8860B]" />
                  </div>
                  {bursary.status === 'closed' && (
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14181D]/85 backdrop-blur-sm">
                      <Lock className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-medium text-white">Closed</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-serif text-2xl text-[#14181D] mb-2">{bursary.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{bursary.description}</p>
                  <button
                    disabled
                    className="mt-auto w-full px-6 py-3 bg-gray-100 text-gray-400 font-medium rounded-md cursor-not-allowed"
                  >
                    Applications closed
                  </button>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-12 max-w-2xl">
          <p className="text-gray-500 leading-relaxed">
            Applications for bursaries are currently closed. Check back later, or contact
            us for information about future opportunities.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
