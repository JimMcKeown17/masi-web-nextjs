import { Heart, Users, GraduationCap, BookOpen } from 'lucide-react';

const impactAreas = [
  {
    icon: BookOpen,
    title: 'Early Childhood Education',
    description: 'Teaching children aged 2-9 how to read, write, and comprehend with proven, data-driven methods.',
    stat: '18,276 children',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Users,
    title: 'Community Jobs',
    description: 'Creating meaningful employment opportunities for local youth to uplift their own communities.',
    stat: '364 jobs in 2024',
    color: 'from-rose-500 to-rose-600'
  },
  {
    icon: GraduationCap,
    title: 'Scholarship Fund',
    description: 'Providing university scholarships, mentoring, and support to talented students.',
    stat: '100+ scholars',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Heart,
    title: 'Community Impact',
    description: 'Building a generation of leaders empowered to solve their own community\'s challenges.',
    stat: '154 schools',
    color: 'from-pink-500 to-pink-600'
  }
];

export default function ImpactSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Your Impact <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Reaches Far</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every donation directly supports our three core programs, creating lasting change in communities across South Africa
            </p>
          </div>

          {/* Impact Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {impactAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative p-8 space-y-4">
                    {/* Icon */}
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${area.color} text-white shadow-lg`}>
                      <Icon className="w-8 h-8" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900">
                      {area.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
                      {area.description}
                    </p>

                    {/* Stat */}
                    <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${area.color} text-white font-semibold text-sm`}>
                      {area.stat}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="inline-block p-8 bg-gradient-to-br from-blue-600 to-rose-600 rounded-2xl shadow-2xl">
              <p className="text-white text-xl md:text-2xl font-semibold max-w-2xl">
                Join us in creating a generation of educated, empowered leaders who will transform South Africa's future.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

