'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function DataPortalStrip() {
    return (
        <section className="relative py-20 md:py-32 bg-white overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-rose-50/20 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left - Image */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="relative group">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-600 to-slate-800 p-8">
                  <Image 
                    src={getImageUrl('images/polar_chart_transparent_white_labels_with_padding.png')}
                    alt="Data Chart"
                    width={700}
                    height={700}
                    className="w-full h-auto relative z-10"
                  />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-rose-600 rounded-full opacity-20 blur-2xl -z-10" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full opacity-20 blur-2xl -z-10" />
              </div>
            </div>

            {/* Right - Content */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                    Our Impact
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Data-Driven <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Results</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We measure dozens of metrics for each child. By leveraging real-time data, we can tailor interventions to meet the specific needs of each child, maximizing the impact of our programs.
                </p>
              </div>

              <div className="pt-4">
                <a 
                  href="/data" 
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-rose-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <span>Enter Data Portal</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
        
    )
}