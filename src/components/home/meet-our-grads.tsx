'use client';

import GradsShowcase from './grads-showcase';
import { ArrowRight } from 'lucide-react';

const graduatesData = [
  {
    id: 1,
    name: 'Azama Zamani',
    credential: 'Advanced Diploma Information Technology',
    quote: 'Graduation means everything to me, thanks to Masinyusane. They supported me through financial struggles, and even covered my graduation attire. Now, their assistance has extended to securing a bursary for my Post-grad Diploma in Cybersecurity.',
    image: 'images/Graduates/Graduate - Sinazo.webp',
    gradientFrom: '#8A38F5',
    gradientTo: '#E72D4D',
  },
  {
    id: 2,
    name: 'Thando Mbeki',
    credential: 'Bachelor of Commerce',
    quote: 'Thanks to Masinyusane, I was able to complete my degree and secure an internship at a leading financial institution. Their support went beyond academics—they believed in my potential.',
    image: 'images/Graduates/Graduate - Aviwe.webp',
    gradientFrom: '#E72D4D',
    gradientTo: '#8A38F5',
  },
  {
    id: 3,
    name: 'Nomsa Dlamini',
    credential: 'Bachelor of Education',
    quote: 'The mentorship and guidance I received from Masinyusane shaped me into the educator I am today. I am now giving back to my community, teaching the next generation.',
    image: 'images/Graduates/Graduate - Sinazo Mpofu.webp',
    gradientFrom: '#294A99',
    gradientTo: '#54B047',
  },
];

export default function MeetOurGrads() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header Section - Top Left Aligned */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="mb-4">
            <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">
              SUCCESS STORIES
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="font-light bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hear from
            </span>{' '}
            <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              our graduates
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
          Discover the inspiring journeys of our graduates and how they're making a difference in their communities.          </p>

          {/* Graduate Magazine Button */}
          <div className="pt-6">
            <a 
              href="/downloads/graduate-magazine.pdf" 
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
              download
            >
              <span>Graduate Magazine</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Carousel Section - Full Width Strip */}
      <GradsShowcase graduates={graduatesData} />
    </section>
  );
}
