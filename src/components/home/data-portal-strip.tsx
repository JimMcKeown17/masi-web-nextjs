'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

export default function DataPortalStrip() {
    return (
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Data-Driven <span className="font-light">Results</span></h2>
              <p className="text-lg mb-8">We measure dozens of metrics for each child. By leveraging real-time data, we can tailor interventions to meet the specific needs of each child, maximizing the impact of our programs.</p>
              <a href="/data" className="relative inline-block px-8 py-3 border-2 border-white text-white font-semibold overflow-hidden group">
                <span className="relative z-10">Enter Data Portal</span>
              </a>
            </div>
            <div className="hidden md:block">
              <Image 
                src={getImageUrl('images/polar_chart_transparent_white_labels_with_padding.png')}
                alt="Data Chart"
                width={600}
                height={600}
                className="w-full h-auto"
              />
              {/* <img src="/images/polar_chart_transparent_white_labels_with_padding.png" alt="Data Chart" className="w-full h-auto" /> */}
            </div>
          </div>
        </div>
      </section>
        
    )
}