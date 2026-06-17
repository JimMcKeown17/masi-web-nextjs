import Image from 'next/image';
import { getImageUrl, getAssetUrl } from '@/lib/imageUrl';
import { FileText } from 'lucide-react';
import { FadeUp } from '@/components/animations/FadeAnimations';

interface FeaturedReport {
  title: string;
  coverImage: string;
  pdfUrl: string;
}

const featuredReports: FeaturedReport[] = [
  {
    title: 'Annual Report 2024',
    coverImage: '/images/AR 24 Cover Page.png',
    pdfUrl: '/reports/2024 Masi Annual Report ($).pdf'
  },
  {
    title: '2024 Graduates Magazine',
    coverImage: '/images/Report Cover 4.png',
    pdfUrl: '/reports/2024 Masi Graduates Magazine.pdf'
  },
  {
    title: '2024 Q2 Children\'s Report',
    coverImage: '/images/Report Cover 3.png',
    pdfUrl: '/reports/2024 Q2 Community Jobs & Childrens Education Report.pdf'
  }
];

export default function FeaturedReportsSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <FadeUp className="max-w-2xl mb-14 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#C81E3C]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Featured</span>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
              Start{' '}
              <span className="italic font-light text-[#C81E3C]">here.</span>
            </h2>
            <p className="text-lg text-gray-600 mt-5">
              The three reports most people come looking for.
            </p>
          </FadeUp>

          {/* Reports grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {featuredReports.map((report, index) => (
              <FadeUp key={index} delay={0.1 * index}>
                <a
                  href={getAssetUrl(report.pdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 bg-white">
                    {/* Cover image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      <Image
                        src={getImageUrl(report.coverImage)}
                        alt={report.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Crimson hover overlay with the view affordance */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#C81E3C]/90 via-[#C81E3C]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                        <span className="flex items-center gap-2 text-white font-medium">
                          <FileText className="w-5 h-5" />
                          View report
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="p-6">
                      <h3 className="font-serif text-xl text-[#14181D] group-hover:text-[#C81E3C] transition-colors">
                        {report.title}
                      </h3>
                    </div>
                  </div>
                </a>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
