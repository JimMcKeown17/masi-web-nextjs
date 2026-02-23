import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const charts = [
  {
    src: '/impact/2024_Letter_Improvement.png',
    alt: 'Letters Known Improvement chart showing 193% improvement in letter knowledge',
    title: 'Letters Known Improvement',
    description:
      'Children improved their letter knowledge by 193%, learning on average 8.5 new letters between baseline and midline assessments.',
  },
  {
    src: '/impact/Grade R Improvement.png',
    alt: 'Grade R Improvement chart showing letter sounds known more than doubling in a 6-week pilot',
    title: 'Grade R Pilot Results',
    description:
      'The 6-week Grade R pilot shows letter sounds known more than doubling from beginning to end of the intervention.',
  },
  {
    src: '/impact/results/ecd_egra_improvement_2025.png',
    alt: 'ECD Centers: Initial vs Midline vs Endline Performance',
    title: 'ECD Centres: Assessment Performance Over Time',
    description:
      'ECD centres showed improvement of 14.9 letters from midline to endline, with children progressing from near-zero letter knowledge to over 22 letters correct.',
  },
  {
    src: '/impact/results/ecd_zero_letter_knowledge_2025.png',
    alt: 'ECD zero letter knowledge reduction chart',
    title: 'ECD: Eliminating Zero Letter Knowledge',
    description:
      'The proportion of ECD children with zero letter knowledge was dramatically reduced through the intervention — showing the programme works even for the most at-risk learners.',
  },
];

export default function ChartsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-yellow-400" />
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Evidence
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Evidence from the Data
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Charts and visualisations from our assessment data showing
            measurable literacy gains across schools.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            <Link href="/impact/data-portal">
              Explore the Data Portal
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {charts.map((chart, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="p-6 pb-4">
                <Image
                  src={chart.src}
                  alt={chart.alt}
                  width={800}
                  height={500}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {chart.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {chart.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
