'use client';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export default function MissionSection() {
  return (
    <section className="bg-[#FAF7F2] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left - Mission statement */}
          <FadeUp className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#1D4ED8]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our mission</span>
            </div>

            <p style={serif} className="text-3xl md:text-4xl leading-[1.25] text-[#14181D]">
              Empower a community to{' '}
              <span className="relative whitespace-nowrap">
                uplift itself
                <span className="absolute left-0 -bottom-1 w-full h-[0.16em] bg-[#1D4ED8]/70 rounded-full" />
              </span>
              , by creating meaningful jobs for people who have never had one.
            </p>

            <p className="text-gray-600 text-lg leading-relaxed">
              Previously unemployed youth are hired to work in creches, preschools, and
              primary schools, teaching children to read, write, and count, and earning
              their first income in the process.
            </p>
          </FadeUp>

          {/* Right - Video */}
          <FadeLeft>
            <div className="relative rounded-lg overflow-hidden shadow-xl ring-1 ring-black/5">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/5j2d6nlFVe8?si=SnKeKovAw1gauiS2"
                  title="Masinyusane Community Jobs"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}
