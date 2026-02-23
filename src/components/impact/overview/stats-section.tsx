import { Users, School, BookOpen, Clock } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '25,000+',
    label: 'Children Supported',
    description: 'Annual reach across ECD, Grade R & Grade 1',
  },
  {
    icon: School,
    value: '500+',
    label: 'Mentors Active',
    description: 'Employed youth making a difference',
  },
  {
    icon: BookOpen,
    value: '250+',
    label: 'Schools',
    description: 'Eastern Cape partner schools',
  },
  {
    icon: Clock,
    value: '7+',
    label: 'Years Running',
    description: 'Of continuous programme delivery',
  },
];

export default function ImpactStatsSection() {
  return (
    <section className="py-20 bg-blue-800 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Masinyusane by the Numbers
          </h2>
          <div className="w-12 h-1 bg-yellow-400 mx-auto mb-5" />
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            A decade of work building a sustainable model for early literacy
            and youth employment
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                <Icon className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                <div className="text-5xl font-bold mb-2 relative inline-block">
                  {stat.value}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-400/60 rounded-full" />
                </div>
                <div className="text-xl font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-white/80">{stat.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
