'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeUp } from '@/components/animations/FadeAnimations';

const founders = [
  {
    id: 1,
    name: 'Jim McKeown',
    image: 'images/staff/Jim-McKeown.jpg',
    bio: [
      'Jim arrived in Gqeberha from New York in 2008 after leaving behind a promising career on Wall Street. He possesses an MA in Development Studies, a BSc in Operations & Research Engineering, and a BA in Computer Engineering.',
      'His journey to South Africa was driven by a desire to provide opportunities for others.',
    ],
  },
  {
    id: 2,
    name: 'Fiks Mahola',
    image: 'images/staff/Ta-Fiks-Mahola.jpg',
    bio: [
      'Fiks is the "heart and soul" of Masinyusane. Passionate about community development, he has been the guiding force in our initiatives.',
      'Leaving behind a promising career in entertainment, Fiks dedicated himself to uplifting others.',
    ],
  },
];

export default function FoundersSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          <FadeUp className="md:col-span-4 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#C81E3C]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our story</span>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D] mb-6">
              Our <span className="italic font-light text-[#C81E3C]">Founders</span>
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Jim and Fiks had both achieved relative success in life, on opposite sides
                of the world: Jim in New York City&apos;s Financial District, Fiks in
                Johannesburg&apos;s entertainment industry.
              </p>
              <p>
                Both felt called to give back. In 2008 they met in New Brighton, Gqeberha,
                and soon after, Masinyusane was born.
              </p>
            </div>
          </FadeUp>

          {founders.map((founder, i) => (
            <FadeUp key={founder.id} delay={0.1 * (i + 1)} className="md:col-span-4">
              <div className="relative group overflow-hidden rounded-xl shadow-lg">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={getImageUrl(founder.image)}
                    alt={founder.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* Persistent name label */}
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="font-serif text-2xl text-white">{founder.name}</h3>
                </div>

                {/* Full bio on hover */}
                <div className="absolute inset-0 bg-[#14181D]/[0.92] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                  <h3 className="font-serif text-2xl mb-3">{founder.name}</h3>
                  {founder.bio.map((paragraph, idx) => (
                    <p key={idx} className="mb-3 text-sm leading-relaxed text-white/85">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 mt-8">
          <p className="md:col-span-8 md:col-start-5 text-sm text-gray-500 italic">
            Additional founders include Fr Jerry Brown, Thobeka Gaxamba, and Tiksie Mabizela.
          </p>
        </div>
      </div>
    </section>
  );
}
