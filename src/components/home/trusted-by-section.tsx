'use client'
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';

export default function TrustedBySection() {
    return (
        <section className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-12">Trusted <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">By</span></h2>
          <div className="relative">
            <div className="flex animate-scroll space-x-12">
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex space-x-12 flex-shrink-0">
                  <Image src={getImageUrl('images/logos/logo-dgmt.jpg')} alt="DGMT" width={200} height={64} className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <Image src={getImageUrl('images/logos/logo-MIT.png')} alt="MIT" width={200} height={64} className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <Image src={getImageUrl('images/logos/logo-DoE.png')} alt="DoE" width={200} height={64} className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <Image src={getImageUrl('images/logos/logo-tlt.png')} alt="TLT" width={200} height={64} className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <Image src={getImageUrl('images/logos/logo-vw.png')} alt="VW" width={200} height={64} className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <Image src={getImageUrl('images/logos/logo-DoE-national.jpeg')} alt="National DoE" width={200} height={64} className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <Image src={getImageUrl('images/logos/logo-dd.png')} alt="DD" width={200} height={64} className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <Image src={getImageUrl('images/logos/logo-yebo.png')} alt="Yebo" width={200} height={64} className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  {/* <img src="/images/logos/logo-dgmt.jpg" alt="DGMT" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" /> */}
                  {/* <img src="/images/logos/logo-MIT.png" alt="MIT" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" /> */}
                  {/* <img src="/images/logos/logo-DoE.png" alt="DoE" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" /> */}
                  {/* <img src="/images/logos/logo-tlt.png" alt="TLT" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" /> */}
                  {/* <img src="/images/logos/logo-vw.png" alt="VW" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" /> */}
                  {/* <img src="/images/logos/logo-DoE-national.jpeg" alt="National DoE" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" /> */}
                  {/* <img src="/images/logos/logo-dd.png" alt="DD" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" /> */}
                  {/* <img src="/images/logos/logo-yebo.png" alt="Yebo" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" /> */}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
        `}</style>
      </section>
        
    )
}