import Image from 'next/image';
import { BookOpen, Briefcase, GraduationCap } from 'lucide-react';

const pillars = [
  {
    icon: BookOpen,
    value: '25,000+',
    label: "Children Supported Annually",
    description: 'Across 200+ schools',
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
    <section className="relative text-white py-24 overflow-hidden">
      {/* Background image */}
      <Image
        src="/impact/child.jpg"
        alt=""
        fill
        className="object-cover"
        priority
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30" />

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

        <div className="hidden sm:grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
