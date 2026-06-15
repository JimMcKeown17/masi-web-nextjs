'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeUp } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

interface Card {
  image: string;
  alt: string;
  title: string;
  body: string;
}

const CARDS: Card[] = [
  {
    image: '/images/youth-2.webp',
    alt: 'A youth coach running a literacy session',
    title: 'Uplifting your own community',
    body: 'Local youth are trained and placed as coaches in their own schools, running one-on-two literacy sessions with the children around them.',
  },
  {
    image: '/images/youth-3.webp',
    alt: 'A young coach at work',
    title: 'Earning an income',
    body: 'Every coach was previously unemployed. A steady, purposeful income lets them improve their own lives and lift their families.',
  },
  {
    image: '/images/youth-4.webp',
    alt: 'A coach gaining training and experience',
    title: 'Training and experience',
    body: 'The job breaks the experience barrier. Many use it as a stepping stone into full-time work, or study at night on our scholarship fund.',
  },
  {
    image: '/images/youth-5.webp',
    alt: 'A community leader',
    title: 'Becoming leaders',
    body: 'There is extraordinary talent in these communities; it just needs the opportunity. Our coaches grow into leaders of their schools.',
  },
];

export default function ChangesSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#1D4ED8]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">More than a paycheck</span>
          </div>
          <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            What a job{' '}
            <span className="italic font-light text-[#1D4ED8]">changes.</span>
          </h2>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {CARDS.map((card, i) => (
            <FadeUp key={card.title} delay={0.08 * i}>
              <div className="h-full rounded-lg overflow-hidden bg-white ring-1 ring-black/5 shadow-sm flex flex-col">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={getImageUrl(card.image)}
                    alt={card.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <span className="h-px w-8 bg-[#1D4ED8]" />
                  <h3 style={serif} className="text-xl leading-snug text-[#14181D]">{card.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{card.body}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
