'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';

export default function ScholarshipStripV2() {
  return (
    <section className="relative bg-white pt-4 md:pt-8 pb-0 md:mt-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-end">
          {/* Left Content */}
          <FadeUp className="space-y-6 pb-8 md:pb-12">
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-4">
                HIGHER EDUCATION
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                <span className="font-bold">Scholarship </span>
                <span className="font-light">Fund</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <a 
                href="https://www.youtube.com/watch?v=QUfevyYW1H8" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 text-white px-8 py-3 rounded-md hover:opacity-90 transition font-medium"
              >
                Watch Video
              </a>
              <a 
                href="/impact/data-portal" 
                className="border-2 px-8 py-3 rounded-md transition font-medium hover:bg-gray-50"
                style={{
                  borderImage: 'linear-gradient(to right, rgb(234 179 8), rgb(249 115 22), rgb(220 38 38)) 1',
                }}
              >
                <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                  Data Portal
                </span>
              </a>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              What would happen if you flooded South Africa's most impoverished communities with university graduates? We are going to find out.
            </p>
          </FadeUp>

          {/* Right Image */}
          <FadeLeft className="relative scale-110 origin-bottom">
            <Image 
              src={getImageUrl('/images/Esethu Ndlungwane - Web 2.webp')}
              alt="Scholarship Fund program graduate"
              width={840}
              height={840}
              className="w-full h-auto"
            />
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}
