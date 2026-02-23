import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { icon: Users, value: '25,000+', label: 'Children per Year' },
  { icon: TrendingUp, value: '75%-200%', label: 'Literacy Improvement' },
  { icon: BookOpen, value: '95%', label: 'Zero-Letter Reduction' },
  { icon: TrendingUp, value: '125%', label: 'Numeracy Improvement' },
];

export default function EducationSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-4 block">
            Children&apos;s Education
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              Transforming Early Literacy & Numeracy
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Pioneering data-driven early literacy & numeracy interventions for children across South Africa.
          </p>
        </div>

        {/* Compact stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-blue-50 rounded-xl p-5 text-center"
              >
                <Icon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl md:text-3xl font-bold text-blue-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Benchmark highlight + Numeracy Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Programme impact chart */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 flex flex-col">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              Doubling the Number of Children Reading in a Classroom
            </h3>
            <div className="flex-1 flex items-center">
              <Image
                src="impact/literacy-improvement.svg"
                alt="Programme impact chart showing reading benchmark improvements in 2024"
                width={600}
                height={350}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          {/* Numeracy improvement */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 flex flex-col">
            <h3 className="text-xl text-center font-bold text-gray-700 mb-4">
              2X'ing Numeracy Skills Each Year
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <Image
                src="impact/numeracy-improvement.svg"
                alt="Programme impact chart showing numeracy scores doubling from 24.6 to 49.6"
                width={450}
                height={263}
                className="w-3/4 h-auto rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Data portal CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Dive deeper into our assessment data, school-level results, and programme trends.
          </p>
          <Button asChild size="lg" className="bg-blue-700 hover:bg-blue-800 text-white">
            <Link href="/impact/data-portal">
              Explore the Data Portal
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
