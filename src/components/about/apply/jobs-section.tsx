'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { ArrowRight, Briefcase } from 'lucide-react';
import { FadeUp } from '@/components/animations/FadeAnimations';

const jobs = [
  {
    id: 1,
    title: 'Youth Job Opportunity',
    description: 'Join our community jobs programme to help uplift local communities.',
    image: '/images/Lit Session 1.jpg',
    applyUrl: 'https://forms.gle/RQyUe2WoyvSot1ws9',
    status: 'open',
  },
  {
    id: 2,
    title: 'Staff Job Opening',
    description: 'Become a part of our team and contribute to our mission.',
    image: '/images/staff/Thembeka-Nobomvu.jpg',
    applyUrl: 'https://forms.gle/Ar6HV9G8CWg4HC7c7',
    status: 'open',
  },
];

export default function JobsSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#1D4ED8]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Career opportunities</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            Masi <span className="italic font-light text-[#1D4ED8]">Jobs</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mt-5 max-w-xl">
            Be part of our mission to empower communities through education.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl">
          {jobs.map((job, i) => (
            <FadeUp key={job.id} delay={0.1 * (i + 1)}>
              <div className="group h-full flex flex-col rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={getImageUrl(job.image)}
                    alt={job.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow">
                    <Briefcase className="w-5 h-5 text-[#1D4ED8]" />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-serif text-2xl text-[#14181D] mb-2">{job.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{job.description}</p>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto self-start inline-flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1740b0] text-white px-6 py-3 rounded-md font-medium transition-colors group/btn"
                  >
                    Apply now
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
