import { FadeUp } from '@/components/animations/FadeAnimations';

const highlights = [
  'Youth creating real change in their own communities',
  'Children discovering the joy of reading',
  'A model that government can scale across South Africa',
  'Data-driven impact you can see and measure',
];

// Zazi iZandi short feature film — swap for a Masi-specific video when available
const FEATURED_VIDEO_ID = 'FQKUQ0hrvSc';

export default function FeaturedVideoSection() {
  return (
    <section id="featured" className="py-20 md:py-28 bg-white scroll-mt-20">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-2xl mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#C81E3C]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Featured Film</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            Zazi iZandi: igniting{' '}
            <span className="italic font-light text-[#C81E3C]">young minds.</span>
          </h2>
          <p className="text-lg text-gray-600 mt-5">
            An in-depth look at the programme and the children, youth and communities
            it reaches across the Eastern Cape.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-center">
          {/* YouTube embed */}
          <FadeUp className="lg:col-span-3">
            <div className="rounded-lg overflow-hidden shadow-xl aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${FEATURED_VIDEO_ID}`}
                title="Zazi iZandi: Igniting Young Minds"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </FadeUp>

          {/* Highlights */}
          <FadeUp delay={0.1} className="lg:col-span-2">
            <p className="text-sm tracking-[0.25em] uppercase text-gray-500 mb-5">
              What the film captures
            </p>
            <ul className="space-y-4">
              {highlights.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C81E3C] shrink-0" />
                  <span className="text-[#14181D] leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
