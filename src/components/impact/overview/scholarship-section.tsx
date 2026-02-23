'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAssetUrl } from '@/lib/imageUrl';
import MeetOurGrads from '@/components/home/meet-our-grads';

export default function ScholarshipSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-4 block">
            Scholarship Fund
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent">
              500+ University Graduates
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Young people from our communities who have graduated from university
            with Masinyusane support — breaking the cycle of poverty through education.
          </p>
        </div>

        {/* Graduates stat + chart placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 items-stretch">
          {/* Grad magazine cover */}
          <a
            href={getAssetUrl('reports/2025 Graduates Magazine.pdf')}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-3 pb-4 border border-orange-100 flex flex-col items-center hover:shadow-lg transition-shadow"
          >
            <div className="flex-1 flex items-center">
              <Image
                src="/impact/grad-magazine-2025.png"
                alt="2025 Graduates Magazine cover"
                width={400}
                height={530}
                className="w-auto h-full object-contain rounded-lg group-hover:scale-[1.02] transition-transform"
              />
            </div>
            <p className="text-center text-sm font-semibold text-orange-600 mt-3 shrink-0 group-hover:text-orange-700 transition-colors">
              Read the 2025 Graduates Magazine &rarr;
            </p>
          </a>

          {/* Road to 500 */}
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-6 border border-orange-100 flex items-center">
            <Image
              src="/impact/road-to-500.png"
              alt="Road to 500 graduates — growth of Masinyusane scholarship fund over the years"
              width={600}
              height={400}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Link to top learners */}
        <div className="mb-12">
          <Link
            href="/programs/top-learners"
            className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors"
          >
            Learn more about our scholarship fund
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Graduate testimonials — reuse MeetOurGrads (full-width carousel) */}
      <MeetOurGrads />
    </section>
  );
}
