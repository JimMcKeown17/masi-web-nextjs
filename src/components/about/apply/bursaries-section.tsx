'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Lock } from 'lucide-react';

const bursaries = [
  {
    id: 1,
    title: 'Masi Scholarship',
    description: 'Funding opportunities for university students.',
    image: '/images/grads/grad2.jpg',
    applyUrl: '#',
    status: 'closed'
  },
  {
    id: 2,
    title: 'Kouga Bursaries',
    description: 'Bursaries for students in the Kouga Kamma Municipality.',
    image: '/images/grads/grad1.jpg',
    applyUrl: '#',
    status: 'closed'
  },
  {
    id: 3,
    title: 'Tsitsikamma Bursaries',
    description: 'Bursaries for students in the Tsitsikamma Communities.',
    image: '/images/grads/grad4.jpg',
    applyUrl: '#',
    status: 'closed'
  }
];

export default function BursariesSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-blue-50/30 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
              Educational Support
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Bursaries</span> & Scholarships
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Financial support for students pursuing higher education
          </p>
        </div>

        {/* Bursaries Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {bursaries.map((bursary) => (
            <Card 
              key={bursary.id} 
              className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={getImageUrl(bursary.image)}
                    alt={bursary.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-6 h-6 text-rose-600" />
                  </div>

                  {/* Status Badge */}
                  {bursary.status === 'closed' && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center gap-2 shadow-lg">
                      <Lock className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">Closed</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {bursary.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {bursary.description}
                  </p>

                  {/* Apply Button - Disabled State */}
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-full cursor-not-allowed transition-all duration-300"
                  >
                    Applications Closed
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Note */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 max-w-2xl mx-auto">
            Applications for bursaries are currently closed. Check back later or contact us for more information about future opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}

