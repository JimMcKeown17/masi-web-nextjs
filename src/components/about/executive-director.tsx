'use client';
import { Award, Play } from 'lucide-react';
import StaffPhoto from '@/components/about/staff-photo';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';

export default function ExecutiveDirector() {
  return (
    <section className="py-20 md:py-28 bg-[#FAF7F2]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Masked photo */}
          <FadeUp className="md:col-span-4 flex justify-center">
            <StaffPhoto
              imageSrc="images/staff/zama-zulu-masked.webp"
              alt="Zama Zulu, Executive Director"
              align="center"
            />
          </FadeUp>

          {/* Bio */}
          <FadeLeft className="md:col-span-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-[#C81E3C]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Leadership</span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] text-[#14181D]">
              Zama <span className="italic font-light text-[#C81E3C]">Zulu</span>
            </h2>
            <p className="text-gray-500 mt-2 mb-6">Executive Director, South Africa</p>

            <div className="flex flex-wrap items-center gap-4 mb-7">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#B8860B]/40 bg-[#B8860B]/10 text-[#8a6608]">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">2025 Citizen of the Year</span>
              </span>

              <a
                href="https://www.youtube.com/watch?v=MqXxGNOeQtM&t=8s"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 bg-[#C81E3C] hover:bg-[#a81632] text-white px-6 py-2.5 rounded-md font-medium transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch award video
              </a>
            </div>

            <div className="space-y-4 text-gray-600 leading-relaxed max-w-2xl">
              <p>
                Zama, our Executive Director, brings a wealth of experience and passion
                to our organisation. With an educational background in accounting, he has
                excelled in the corporate landscape of South Africa, contributing to the
                growth of numerous leading companies throughout his career.
              </p>
              <p>
                A successful entrepreneur, Zama has demonstrated an exceptional ability to
                innovate and lead. His unwavering dedication to fostering a new generation
                of leaders is at the heart of his work at Masinyusane.
              </p>
            </div>
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}
