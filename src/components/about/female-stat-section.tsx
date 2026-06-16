'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';
import CountUp from '@/components/animations/count-up';

const employeeImages = [
  'images/LCs/LC-1.jpg',
  'images/LCs/LC-10.jpg',
  'images/LCs/LC-3.jpg',
  'images/LCs/LC-11.jpg',
  'images/LCs/LC-5.jpg',
  'images/LCs/LC-12.jpg',
  'images/LCs/LC-2.jpg',
  'images/LCs/LC-13.jpg',
  'images/LCs/LC-4.jpg',
];

export default function FemaleStatSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FAF7F2]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <FadeUp>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#1D4ED8]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our employees</span>
            </div>
            <p className="font-serif text-3xl md:text-5xl leading-[1.15] text-[#14181D]">
              <span className="text-[#1D4ED8]"><CountUp to={92} suffix="%" /></span> of the people we
              employ are <span className="italic">women</span>.
            </p>
            <p className="text-gray-600 leading-relaxed mt-6 max-w-md">
              We hire from the communities we serve, and we hire women first. They are
              the backbone of every programme we run.
            </p>
          </FadeUp>

          <FadeLeft className="grid grid-cols-3 gap-3 md:gap-4">
            {employeeImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 group"
              >
                <Image
                  src={getImageUrl(image)}
                  alt={`Masinyusane employee ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}
