import Image from 'next/image';
import { ExternalLink, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const newsItems = [
  {
    image: '/media/news/Ramaphosa SONA 2026.jpeg',
    title: "Masinyusane Featured in President Ramaphosa's State of the Nation Address",
    source: 'SONA 2025 Report',
    date: '2025',
    excerpt:
      'President Cyril Ramaphosa highlighted the Zazi iZandi programme in his State of the Nation Address, citing it as a leading example of youth employment and early literacy impact — with Education Assistants central to his vision for expanding youth jobs in South African schools.',
    link: '/reports/SONA 2025 Report.pdf',
  },
  {
    image: '/media/news/In The News - President 2.png',
    title: 'President Launches Fifth Phase of Basic Education Employment Initiative',
    source: 'Office of the Presidency',
    date: '2025',
    excerpt:
      'President Cyril Ramaphosa announces the fifth phase of the BEEI — South Africa\'s largest youth employment programme — placing 200,000 young people in schools as reading champions, curriculum assistants, and more.',
    link: 'https://www.thepresidency.gov.za/node/9033',
  },
  {
    image: '/media/news/The Herald Zama.png',
    title: 'Local Literacy Program Shows Remarkable Results',
    source: 'The Herald',
    date: '2023',
    excerpt:
      'The Herald feature on how Masinyusane\'s structured phonics approach is transforming reading outcomes in Gqeberha township schools.',
    link: 'https://www.theherald.co.za/news/2025-06-09-gqeberha-npo-making-a-real-difference-one-school-at-a-time/',
  },
];

export default function NewsSection() {
  return (
    <>
      {/* Header — subtle blue tint */}
      <section className="pt-20 pb-12 bg-blue-50/60">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-yellow-400" />
              <span className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                Press Coverage
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Masinyusane in the Media
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Masinyusane has been featured in national and local press for its
              impact on early literacy and youth employment in South Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Featured video — Citizen of the Year */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Citizen of the Year 2025
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Masinyusane Executive Director Zama Zulu was named Citizen of the Year
                for her tireless work transforming early literacy and creating youth
                employment across South Africa.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg aspect-video">
              <iframe
                src="https://www.youtube.com/embed/MqXxGNOeQtM"
                title="Zama Zulu — Citizen of the Year 2025"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* News cards — light gray */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((item, index) => (
              <article
                key={index}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={640}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{item.date}</span>
                    <span className="mx-1">|</span>
                    <span className="font-medium text-blue-700">{item.source}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {item.excerpt}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-700 hover:text-blue-800 p-0 h-auto font-semibold"
                    asChild
                  >
                    {item.link.endsWith('.pdf') ? (
                      <a href={item.link} download>
                        Download Report
                        <Download className="h-3.5 w-3.5 ml-1.5" />
                      </a>
                    ) : (
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        Read Article
                        <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                      </a>
                    )}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
