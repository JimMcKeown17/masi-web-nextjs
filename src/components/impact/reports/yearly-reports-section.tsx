import { FileText } from 'lucide-react';
import { getAssetUrl } from '@/lib/imageUrl';
import { FadeUp } from '@/components/animations/FadeAnimations';

interface Report {
  name: string;
  url: string;
  available?: boolean;
}

interface YearlyReports {
  year: string;
  reports: Report[];
}

const yearlyReports: YearlyReports[] = [
  {
    year: '2024',
    reports: [
      { name: 'Annual Report', url: '/reports/Masinyusane Annual Report 2024 (R).pdf' },
      { name: "Children's Report", url: '/reports/2024 Q2 Community Jobs & Childrens Education Report.pdf' },
      { name: 'Top Learner Report', url: '/reports/2024 Masi Graduates Magazine.pdf' },
      { name: 'Audited Financial Statements (RSA)', url: '/reports/Masinyusane Audited Financial Statements 2024.pdf' }
    ]
  },
  {
    year: '2023',
    reports: [
      { name: 'Annual Report', url: '/reports/2023 Masinyusane Annual Report (RSA).pdf' },
      { name: "Children's Report", url: '/reports/2024 Q2 Community Jobs & Childrens Education Report.pdf' },
      { name: 'Top Learner Report', url: '/reports/2023 Masi Graduates Magazine.pdf' },
      { name: 'Audited Financial Statements (RSA)', url: '/reports/Masinyusane Audited Financial Statements 2023.pdf' }
    ]
  },
  {
    year: '2022',
    reports: [
      { name: 'Annual Report', url: '/reports/2022 Masinyusane Annual Report (R).pdf' },
      { name: "Children's Report", url: '/reports/2022 Q4 Childrens Report - All Donors.pdf' },
      { name: 'Top Learner Report', url: '/reports/2022 Masi Graduates Report.pdf' },
      { name: 'Audited Financial Statements (RSA)', url: '/reports/Masinyusane Audited Financial Statements 2022.pdf' }
    ]
  },
  {
    year: '2021',
    reports: [
      { name: 'Annual Report', url: '#', available: false },
      { name: "Children's Report", url: '#', available: false },
      { name: 'Top Learner Report', url: '#', available: false },
      { name: 'Audited Financial Statements (RSA)', url: '/reports/Masinyusane Audited Financial Statements 2021.pdf' }
    ]
  }
];

export default function YearlyReportsSection() {
  return (
    <section id="archive" className="py-20 md:py-28 bg-[#FAF7F2] scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <FadeUp className="max-w-2xl mb-14 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#C81E3C]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Full archive</span>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
              Browse by{' '}
              <span className="italic font-light text-[#C81E3C]">year.</span>
            </h2>
            <p className="text-lg text-gray-600 mt-5">
              Every report and audited statement we have published, by year.
            </p>
          </FadeUp>

          {/* Yearly reports grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {yearlyReports.map((yearData, index) => (
              <FadeUp key={index} delay={0.08 * index} className="space-y-5">
                {/* Year header */}
                <div className="flex items-baseline gap-3 pb-3 border-b border-[#14181D]/15">
                  <span className="font-serif text-4xl md:text-5xl text-[#14181D]">
                    {yearData.year}
                  </span>
                  <span className="h-px flex-1 bg-[#C81E3C]/40" />
                </div>

                {/* Reports list */}
                <ul className="space-y-3.5">
                  {yearData.reports.map((report, reportIndex) => (
                    <li key={reportIndex}>
                      {report.available !== false ? (
                        <a
                          href={getAssetUrl(report.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-2.5 text-[#14181D] hover:text-[#C81E3C] transition-colors"
                        >
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#C81E3C]" />
                          <span className="text-sm leading-relaxed group-hover:underline underline-offset-2">
                            {report.name}
                          </span>
                        </a>
                      ) : (
                        <div className="flex items-start gap-2.5 text-gray-400">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            {report.name}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </FadeUp>
            ))}
          </div>

          {/* Info note */}
          <FadeUp className="mt-16">
            <p className="text-gray-600">
              For reports prior to 2021 or specific inquiries, please{' '}
              <a
                href="mailto:info@masinyusane.org"
                className="text-[#14181D] font-medium border-b-2 border-[#C81E3C] pb-0.5 hover:text-[#C81E3C] transition-colors"
              >
                contact us
              </a>
              .
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
