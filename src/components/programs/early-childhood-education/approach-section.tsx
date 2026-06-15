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
    image: '/images/Child with Score Spider Chart.png',
    alt: 'A child with their literacy assessment chart',
    title: 'Taught at the right level',
    body: 'We track a dozen skills for every child and teach them in order, staying with each child until they have mastered each one.',
  },
  {
    image: '/images/Teacher Assistant with Child 2.png',
    alt: 'A teacher assistant working with a child',
    title: 'Built to scale with government',
    body: 'We design versions of our programmes that government, NGOs, and schools can run themselves, training teacher assistants to deliver them.',
  },
  {
    image: '/images/Sandwater Primary - Literacy Session 2.jpg',
    alt: 'A storytelling session at Sandwater Primary',
    title: 'A thousand stories',
    body: 'Every child hears 1,000 stories before the age of seven, building the vocabulary, memory, and imagination that reading depends on.',
  },
];

export default function ApproachSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#C81E3C]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our approach</span>
          </div>
          <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            More than reading{' '}
            <span className="italic font-light text-[#C81E3C]">lessons.</span>
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-8">
          {CARDS.map((card, i) => (
            <FadeUp key={card.title} delay={0.1 * i}>
              <div className="h-full rounded-lg overflow-hidden bg-white ring-1 ring-black/5 shadow-sm flex flex-col">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={getImageUrl(card.image)}
                    alt={card.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <span className="h-px w-8 bg-[#C81E3C]" />
                  <h3 style={serif} className="text-2xl leading-snug text-[#14181D]">{card.title}</h3>
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
