'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';

export default function YouthStripV2() {
  return (
    <section className="relative bg-white pt-16 md:pt-20 pb-0 md:mt-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-end">
          {/* Left Content */}
          <FadeUp className="space-y-6 pb-8 md:pb-12">
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-4">
                OUR PROGRAMMES
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                <span className="font-light">Creating </span>
                <span className="font-bold">Community Jobs</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <a 
                href="https://www.youtube.com/watch?v=5j2d6nlFVe8&t=3s" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-md hover:opacity-90 transition font-medium"
              >
                Watch Video
              </a>
              <a 
                href="/impact/data-portal" 
                className="border-2 px-8 py-3 rounded-md transition font-medium hover:bg-gray-50"
                style={{
                  borderImage: 'linear-gradient(to right, rgb(34 197 94), rgb(37 99 235)) 1',
                }}
              >
                <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                  Data Portal
                </span>
              </a>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              We create local jobs for unemployed youth, training them to coach literacy and numeracy in public schools. All day. Every day.
            </p>
          </FadeUp>

          {/* Right Image */}
          <FadeLeft className="relative scale-145 origin-bottom">
            <Image 
              src={getImageUrl('/images/Azaluve Mama & Aphathelwe Makabana.webp')}
              alt="Community Jobs program participants"
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


