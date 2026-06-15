'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeUp } from '@/components/animations/FadeAnimations';

const LOGOS = [
  { src: 'images/logos/logo-dgmt.jpg', alt: 'DGMT' },
  { src: 'images/logos/logo-MIT.png', alt: 'MIT' },
  { src: 'images/logos/logo-DoE.png', alt: 'Eastern Cape Department of Education' },
  { src: 'images/logos/logo-tlt.png', alt: 'The Learning Trust' },
  { src: 'images/logos/logo-vw.png', alt: 'Volkswagen' },
  { src: 'images/logos/logo-DoE-national.jpeg', alt: 'National Department of Basic Education' },
  { src: 'images/logos/logo-dd.png', alt: 'Dimension Data' },
  { src: 'images/logos/logo-yebo.png', alt: 'Yebo' },
];

export default function TrustedByV3() {
  return (
    <section className="py-16 md:py-20 bg-[#FAF7F2] overflow-hidden">
      <div className="container mx-auto px-4">
        <FadeUp>
          <div className="flex items-center gap-3 mb-10">
            <span className="h-px w-10 bg-[#E72D4D]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">
              Partners &amp; funders
            </span>
          </div>
        </FadeUp>
      </div>

      <div
        className="relative"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
      >
        <div className="flex animate-scroll-v3 items-center gap-8 w-max">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-8 flex-shrink-0">
              {LOGOS.map((l) => (
                <div
                  key={`${idx}-${l.alt}`}
                  className="flex items-center justify-center h-24 w-48 bg-white rounded-lg shadow-sm ring-1 ring-black/5 px-6"
                >
                  <Image
                    src={getImageUrl(l.src)}
                    alt={l.alt}
                    width={200}
                    height={64}
                    className="max-h-14 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-v3 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-v3 {
          animation: scroll-v3 45s linear infinite;
        }
      `}</style>
    </section>
  );
}
