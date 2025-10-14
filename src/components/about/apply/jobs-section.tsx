'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Briefcase } from 'lucide-react';

const jobs = [
  {
    id: 1,
    title: 'Youth Job Opportunity',
    description: 'Join our community jobs program to help uplift local communities.',
    image: '/images/Lit Session 1.jpg',
    applyUrl: 'https://forms.gle/RQyUe2WoyvSot1ws9',
    status: 'open'
  },
  {
    id: 2,
    title: 'Staff Job Opening',
    description: 'Become a part of our team and contribute to our mission.',
    image: '/images/staff/Thembeka-Nobomvu.jpg',
    applyUrl: 'https://forms.gle/Ar6HV9G8CWg4HC7c7',
    status: 'open'
  }
];

export default function JobsSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
              Career Opportunities
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Masi <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Jobs</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Be part of our mission to empower communities through education
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={getImageUrl(job.image)}
                    alt={job.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Apply Button */}
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 group/btn"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

