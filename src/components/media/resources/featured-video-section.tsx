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
    // Cover story: the featured film leads the page. pt clears the fixed navbar.
    <section className="pt-28 md:pt-36 pb-20 md:pb-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Title + context + highlights */}
          <FadeUp className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#C81E3C]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Media Resources</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
              Zazi iZandi: igniting{' '}
              <span className="italic font-light text-[#C81E3C]">young minds.</span>
            </h1>
            <p className="text-lg text-gray-600 mt-6">
              An in-depth look at the programme and the children, youth and communities
              it reaches across the Eastern Cape.
            </p>
            <ul className="space-y-3 mt-7">
              {highlights.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C81E3C] shrink-0" />
                  <span className="text-[#14181D] leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </FadeUp>

          {/* Featured film */}
          <FadeUp delay={0.1} className="lg:col-span-7">
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
        </div>
      </div>
    </section>
  );
}
