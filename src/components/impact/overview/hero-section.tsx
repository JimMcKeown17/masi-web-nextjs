import { BookOpen, Briefcase, GraduationCap } from 'lucide-react';

const pillars = [
  {
    icon: BookOpen,
    value: '25,000+',
    label: "Children's Education",
    description: 'Children assessed across 250+ schools',
  },
  {
    icon: Briefcase,
    value: '1,806',
    label: 'Jobs Created',
    description: 'Women employed from the community',
  },
  {
    icon: GraduationCap,
    value: '500+',
    label: 'University Graduates',
    description: 'Scholarship fund recipients who graduated',
  },
];

export default function ImpactHeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24 overflow-hidden">
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="text-sm font-semibold tracking-widest uppercase text-blue-200 mb-4 block">
            Masinyusane Impact
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Impact</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Three pillars of impact — transforming children&apos;s education, creating
            dignified employment, and supporting university graduates across South Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.label}
                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <Icon className="h-10 w-10 mx-auto mb-3 text-blue-200" />
                <div className="text-4xl font-bold mb-1">{pillar.value}</div>
                <div className="text-lg font-semibold mb-1">{pillar.label}</div>
                <div className="text-sm text-white/70">{pillar.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
