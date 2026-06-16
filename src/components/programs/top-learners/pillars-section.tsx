'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeUp, FadeLeft, FadeRight } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// Two pillars that need more room than a timeline node: the Houses of Excellence and
// the Girls Scholarship Fund. Each carries a real, attributed graduate pull-quote drawn
// from the grad magazines. The photo is illustrative, not the quoted person, so no name
// caption sits on the image. Accent: gold #B8860B.
interface Pillar {
  eyebrow: string;
  titleTop: string;
  titleAccent: string;
  body: string;
  quote: string;
  author: string;
  credential: string;
  image: string;
  alt: string;
  imageOnRight: boolean;
}

const PILLARS: Pillar[] = [
  {
    eyebrow: 'More than a scholarship',
    titleTop: 'Houses of',
    titleAccent: 'Excellence.',
    body: 'Many of our students would otherwise commute hours each day, or study in crowded homes with no quiet, no desk, and no food. Our Houses of Excellence give them something rare: a safe, free place to live and eat, surrounded by peers chasing the very same goal.',
    quote: 'They became my second family and gave me a home away from home.',
    author: 'Amlindile Maneli',
    credential: 'Diploma in Management',
    image: '/images/tl-photo-3.webp',
    alt: 'Students supported by the Masinyusane Houses of Excellence',
    imageOnRight: true,
  },
  {
    eyebrow: 'Investing where it counts',
    titleTop: 'The Girls',
    titleAccent: 'Scholarship Fund.',
    body: 'Young women do more to lift their families and communities out of poverty, and are handed far fewer chances to do it. So we invest in them deliberately, sending talented young women into Engineering, Science, Accounting and Law, and watching them become a generation of leaders.',
    quote: 'Being a woman in a male-dominated space added an extra layer of challenge. But no dream is too big when you are willing to fight for it.',
    author: 'Pontso Lekaba',
    credential: 'BEng Tech, Electrical Engineering',
    image: '/images/tl-photo-2.webp',
    alt: 'A young woman graduate supported by the Girls Scholarship Fund',
    imageOnRight: false,
  },
];

function PillarStrip({ pillar }: { pillar: Pillar }) {
  const ImageFade = pillar.imageOnRight ? FadeLeft : FadeRight;
  return (
    <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* Image */}
      <ImageFade className={pillar.imageOnRight ? 'md:order-2' : 'md:order-1'}>
        <div className="relative rounded-lg overflow-hidden shadow-xl ring-1 ring-black/5">
          <div className="relative aspect-[4/3]">
            <Image
              src={getImageUrl(pillar.image)}
              alt={pillar.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </ImageFade>

      {/* Text */}
      <FadeUp className={pillar.imageOnRight ? 'md:order-1' : 'md:order-2'}>
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-10 bg-[#B8860B]" />
          <span className="text-sm tracking-[0.25em] uppercase text-gray-500">{pillar.eyebrow}</span>
        </div>
        <h2 style={serif} className="text-3xl md:text-5xl leading-[1.06] text-[#14181D]">
          {pillar.titleTop}
          <br />
          <span className="italic font-light text-[#B8860B]">{pillar.titleAccent}</span>
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed mt-6">{pillar.body}</p>

        <figure className="mt-8 border-l-2 border-[#B8860B] pl-5">
          <blockquote style={serif} className="text-xl md:text-2xl italic leading-snug text-[#14181D]">
            {pillar.quote}
          </blockquote>
          <figcaption className="mt-3 text-sm text-gray-500">
            <span className="font-semibold text-[#14181D] not-italic">{pillar.author}</span>
            {' '}&middot;{' '}{pillar.credential}
          </figcaption>
        </figure>
      </FadeUp>
    </div>
  );
}

export default function PillarsSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-20 md:space-y-28">
          {PILLARS.map((pillar) => (
            <PillarStrip key={pillar.author} pillar={pillar} />
          ))}
        </div>
      </div>
    </section>
  );
}
