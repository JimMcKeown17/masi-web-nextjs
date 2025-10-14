import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { FileText } from 'lucide-react';

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
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Featured <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Reports</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our latest impact reports and publications
            </p>
          </div>

          {/* Reports Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {featuredReports.map((report, index) => (
              <a
                key={index}
                href={report.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                  {/* Cover Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <Image
                      src={getImageUrl(report.coverImage)}
                      alt={report.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <FileText className="w-5 h-5" />
                        <span>View Report</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

