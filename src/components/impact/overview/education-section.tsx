import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, School, Users, TrendingUp, BookOpen } from 'lucide-react';

const stats = [
  { icon: School, value: '250+', label: 'Schools' },
  { icon: Users, value: '25,000+', label: 'Learners Assessed' },
  { icon: TrendingUp, value: '45%', label: 'Literacy Improvement' },
  { icon: BookOpen, value: '95%', label: 'Zero-Letter Reduction' },
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
              Transforming Early Literacy
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Through the Zazi iZandi programme, we assess and support children across
            the Eastern Cape, delivering measurable literacy gains at scale.
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

        {/* Benchmark highlight + Numeracy placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Programme impact chart */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              2024 Programme Impact
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              In 2024, we doubled the number of children reaching their reading
              benchmark — from 13% to over 52%.
            </p>
            <Image
              src="/zazi-izandi/images/programme-impact-2024.svg"
              alt="Programme impact chart showing reading benchmark improvements in 2024"
              width={600}
              height={350}
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Numeracy placeholder */}
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Numeracy Programme
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Coming soon — expanding our impact to numeracy outcomes.
            </p>
            <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              In Development
            </span>
          </div>
        </div>

        {/* Link to ZZ programme */}
        <Link
          href="/programs/zazi-izandi"
          className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-800 transition-colors"
        >
          Learn more about Zazi iZandi
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
