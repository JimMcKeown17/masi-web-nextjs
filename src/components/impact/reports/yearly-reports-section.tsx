import { FileText, Eye } from 'lucide-react';
import Link from 'next/link';

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
    <section className="py-20 md:py-28 bg-gradient-to-b from-blue-50/30 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Archive by <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Year</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our comprehensive collection of reports and financial statements
            </p>
          </div>

          {/* Yearly Reports Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {yearlyReports.map((yearData, index) => (
              <div key={index} className="space-y-4">
                {/* Year Header */}
                <div className="pb-4 border-b-2 border-gradient-to-r from-blue-600 to-rose-600">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                    {yearData.year}
                  </h3>
                </div>

                {/* Reports List */}
                <ul className="space-y-3">
                  {yearData.reports.map((report, reportIndex) => (
                    <li key={reportIndex}>
                      {report.available !== false ? (
                        <div className="space-y-2">
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            <FileText className="w-4 h-4 mt-1 flex-shrink-0 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span className="text-sm leading-relaxed group-hover:underline">
                              {report.name}
                            </span>
                          </a>
                          {report.name === 'Annual Report' && (
                            <Link
                              href={`/impact/annual-report/${yearData.year}`}
                              className="ml-6 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View in Reader
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-gray-400">
                          <FileText className="w-4 h-4 mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            {report.name}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Info Note */}
          <div className="mt-16 text-center">
            <p className="text-gray-600">
              For reports prior to 2021 or specific inquiries, please{' '}
              <a href="mailto:info@masinyusane.org" className="text-blue-600 hover:underline font-semibold">
                contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

