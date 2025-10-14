import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

const founders = [
  {
    id: 1,
    name: 'Jim McKeown',
    image: 'images/staff/Jim McKeown.jpg',
    bio: [
      'Jim arrived in Gqeberha from New York in 2008 after leaving behind a promising career on Wall Street. He possesses an MA in Development Studies, a BSc in Operations & Research Engineering, and a BA in Computer Engineering.',
      'His journey to South Africa was driven by a desire to provide opportunities for others.'
    ]
  },
  {
    id: 2,
    name: 'Fiks Mahola',
    image: 'images/staff/Ta Fiks Mahola.jpg',
    bio: [
      'Fiks is the "heart and soul" of Masinyusane. Passionate about community development, he has been the guiding force in our initiatives.',
      'Leaving behind a promising career in entertainment, Fiks dedicated himself to uplifting others.'
    ]
  }
];

export default function FoundersSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 flex flex-col justify-center">
            <div className="inline-block mb-3">
              <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                Our Story
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Our <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Founders</span>
            </h2>
            <p className="text-lg mb-4">
              Our founders, Jim &amp; Fiks had both achieved relative success in life, albeit on opposite sides of the world.
              Jim in New York City&apos;s Financial District and Fiks in Johannesburg&apos;s entertainment industry.
            </p>
            <p className="text-lg">
              The beneficiaries of countless opportunities and the love and sacrifice of many, both felt called to give back.
              In 2008, they met in New Brighton, Gqeberha, and soon after, Masinyusane was born.
            </p>
          </div>
          {founders.map((founder) => (
            <div key={founder.id} className="md:col-span-4">
              <div className="relative group overflow-hidden rounded-lg shadow-xl">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={getImageUrl(founder.image)}
                    alt={founder.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h5 className="text-2xl font-bold mb-3">{founder.name}</h5>
                    {founder.bio.map((paragraph, idx) => (
                      <p key={idx} className="mb-3 text-sm leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 mt-6">
          <div className="md:col-span-8 md:col-start-5">
            <p className="text-sm text-gray-600 italic">
              * Additional founders include Fr Jerry Brown, Thobeka Gaxamba, and Tiksie Mabizela.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

