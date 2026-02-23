'use client';

import Link from 'next/link';
import { ArrowRight, GraduationCap, BarChart3 } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Big stat */}
          <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-8 border border-orange-100 flex flex-col justify-center items-center text-center">
            <GraduationCap className="h-12 w-12 text-orange-500 mb-4" />
            <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent mb-2">
              500+
            </div>
            <p className="text-gray-700 text-lg font-medium mb-1">
              University Graduates
            </p>
            <p className="text-gray-500 text-sm max-w-sm">
              Supported through bursaries, mentorship, and academic guidance from
              first year through to graduation.
            </p>
          </div>

          {/* Chart placeholder */}
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 flex flex-col justify-center items-center text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Graduates Over Time
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              A chart showing graduate numbers by year will be added here.
            </p>
            <span className="inline-block text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              Chart Coming Soon
            </span>
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
