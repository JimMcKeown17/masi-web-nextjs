'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  School, Landmark, GraduationCap, Briefcase,
  Compass, BookOpen, ClipboardList, Presentation, Apple,
  HandCoins, Home, Bus, HeartHandshake, Users,
  Lightbulb, Target, ArrowRight,
} from 'lucide-react';
import { FadeUp } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// The journey, rebuilt natively from the print path graphic as data, so it reflows
// to any screen and recolours to the gold scholarship accent. Milestones are the four
// big life stages; steps are the support we provide at each. Touchpoint icons echo
// the original diagram. Accent: gold #B8860B.
type Step = { icon: React.ComponentType<{ className?: string }>; label: string };
type Phase = {
  stage: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  blurb: string;
  highlight?: string;
  steps: Step[];
  last?: boolean;
};

const PHASES: Phase[] = [
  {
    stage: 'Stage 01',
    title: 'High School',
    icon: School,
    blurb:
      'We find the brightest learners across Gqeberha’s township high schools and get them university-ready, the part the system leaves to chance.',
    steps: [
      { icon: Compass, label: 'Career Guidance' },
      { icon: BookOpen, label: 'Study Guides' },
      { icon: ClipboardList, label: 'University Applications' },
      { icon: Presentation, label: 'Workshops' },
      { icon: Apple, label: 'Food & Welfare' },
    ],
  },
  {
    stage: 'Stage 02',
    title: 'University',
    icon: Landmark,
    blurb:
      'Once they are in, we remove every reason they might have to drop out, so the only thing left to focus on is the degree.',
    highlight:
      'Every learner holds a full Masinyusane scholarship and a place to live at our Houses of Excellence.',
    steps: [
      { icon: HandCoins, label: 'Full Scholarships' },
      { icon: Home, label: 'Houses of Excellence' },
      { icon: Bus, label: 'Bus Fare & Food' },
      { icon: HeartHandshake, label: 'Mentoring' },
      { icon: Users, label: 'Leadership Workshops' },
    ],
  },
  {
    stage: 'Stage 03',
    title: 'Graduation',
    icon: GraduationCap,
    blurb:
      'A degree in hand, and the practical skills to turn it into a livelihood rather than another job queue.',
    steps: [
      { icon: Lightbulb, label: 'Entrepreneurship Training' },
      { icon: Target, label: 'Job Readiness Training' },
    ],
  },
  {
    stage: 'Stage 04',
    title: 'Employment',
    icon: Briefcase,
    blurb:
      'A career that lifts a whole family out of poverty, and a living example to the next child of exactly what is possible.',
    steps: [],
    last: true,
  },
];

export default function JourneySection() {
  const ref = useRef<HTMLDivElement>(null);
  // Spine draws itself as the section scrolls through the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.5'],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });

  return (
    <section className="bg-white py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#B8860B]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">The path we walk</span>
          </div>
          <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            From a township classroom
            <br />
            to a <span className="italic font-light text-[#B8860B]">career.</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mt-6">
            A scholarship is the headline, but it is only one stop on a much longer road. We
            walk every step of it with our students, for up to a decade.
          </p>
        </FadeUp>

        <div ref={ref} className="relative max-w-3xl mx-auto">
          {/* Spine: faint track + gold fill that draws on scroll */}
          <div className="absolute left-8 top-7 bottom-7 w-0.5 -translate-x-1/2 bg-[#B8860B]/15" />
          <motion.div
            style={{ scaleY }}
            className="absolute left-8 top-7 bottom-7 w-0.5 -translate-x-1/2 origin-top bg-[#B8860B]"
          />

          {PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <div key={phase.title} className="relative pl-24 pb-14 last:pb-0">
                {/* Milestone node, sitting on the spine. The final stop (Employment) is
                    a solid gold fill: the destination reads differently from the journey. */}
                <div className="absolute left-8 top-0 -translate-x-1/2 z-10">
                  <div
                    className={`w-16 h-16 rounded-full ring-2 ring-[#B8860B] shadow-[0_2px_12px_rgba(184,134,11,0.18)] flex items-center justify-center ${
                      phase.last ? 'bg-[#B8860B]' : 'bg-white'
                    }`}
                  >
                    <Icon className={`w-7 h-7 ${phase.last ? 'text-white' : 'text-[#B8860B]'}`} />
                  </div>
                </div>

                <FadeUp>
                  <span className="text-xs tracking-[0.25em] uppercase text-[#B8860B] font-medium">
                    {phase.stage}
                  </span>
                  <h3 style={serif} className="text-2xl md:text-3xl text-[#14181D] mt-1 flex items-center gap-3">
                    {phase.title}
                    {phase.last && <ArrowRight className="w-6 h-6 text-[#B8860B]" />}
                  </h3>
                  <p className="text-gray-600 mt-2.5 max-w-xl leading-relaxed">{phase.blurb}</p>

                  {phase.highlight && (
                    <div className="mt-5 rounded-lg bg-[#B8860B]/[0.07] ring-1 ring-[#B8860B]/20 px-5 py-4">
                      <p style={serif} className="text-[#14181D] italic leading-snug">
                        {phase.highlight}
                      </p>
                    </div>
                  )}

                  {phase.steps.length > 0 && (
                    <div className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
                      {phase.steps.map((step) => {
                        const StepIcon = step.icon;
                        return (
                          <div key={step.label} className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B8860B]/10 ring-1 ring-[#B8860B]/20">
                              <StepIcon className="h-[18px] w-[18px] text-[#B8860B]" />
                            </span>
                            <span className="text-[#14181D] leading-snug">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </FadeUp>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
