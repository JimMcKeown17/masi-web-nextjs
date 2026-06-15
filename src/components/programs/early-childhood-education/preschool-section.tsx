'use client';
import Image from 'next/image';
import { Tablet, Calculator, BookOpen, Palette } from 'lucide-react';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// Draft copy from Jim's description (Feb 2026). Confirm the location, the count
// of centres ("first open, second being built"), and the station list before shipping.
const STATIONS = [
  { icon: Tablet, label: 'iPads', note: 'EduTech literacy and numeracy apps' },
  { icon: Calculator, label: 'Numeracy stations', note: 'Hands-on early maths' },
  { icon: BookOpen, label: 'Reading corners', note: 'Books and storytelling' },
  { icon: Palette, label: 'Creative arts', note: 'Drawing, making, play' },
];

export default function PreschoolSection() {
  return (
    <section className="bg-[#0E1116] text-white py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text + stations */}
          <FadeUp className="space-y-7">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#E72D4D]" />
              <span className="text-sm tracking-[0.25em] uppercase text-white/60">Our own centres</span>
            </div>

            <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05]">
              We build and run{' '}
              <span className="italic font-light text-[#E72D4D]">preschools.</span>
            </h2>

            <p className="text-white/80 text-lg leading-relaxed">
              At our Sume Centre, every group of children has its own teacher and rotates
              through a complete early-learning environment. It is a joyful, well-equipped
              place to learn, and for these children it is life-changing. Our first centre
              is open, and we are building a second.
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-2">
              {STATIONS.map(({ icon: Icon, label, note }) => (
                <div key={label} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-11 h-11 rounded-full bg-white/5 ring-1 ring-white/15 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#E72D4D]" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-medium leading-tight">{label}</p>
                    <p className="text-sm text-white/55 mt-0.5">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Photo */}
          <FadeLeft>
            <div className="relative rounded-lg overflow-hidden ring-1 ring-white/10">
              <div className="relative aspect-[3/2]">
                <Image
                  src="/programs/early-childhood-education/sume-centre.jpg"
                  alt="Children learning on iPads at the Sume Centre EduTech preschool classroom"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <p className="text-sm text-white/75">Sume Centre, EduTech classroom</p>
              </div>
            </div>
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}
