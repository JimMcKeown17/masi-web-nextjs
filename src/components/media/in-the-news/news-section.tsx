import Image from 'next/image';
import { ExternalLink, Download } from 'lucide-react';
import { FadeUp } from '@/components/animations/FadeAnimations';

const newsItems = [
  {
    image: '/media/news/Ramaphosa SONA 2026.jpeg',
    title: "Masinyusane Featured in President Ramaphosa's State of the Nation Report.",
    source: 'SONA 2025 Report',
    date: '2025',
    excerpt:
      'President Cyril Ramaphosa highlighted the Zazi iZandi programme in his State of the Nation Address, citing it as a leading example of youth employment and early literacy impact, with Education Assistants central to his vision for expanding youth jobs in South African schools.',
    link: '/reports/SONA 2025 Report.pdf',
  },
  {
    image: '/media/news/In The News - President 2.png',
    title: 'President Launches Fifth Phase of Basic Education Employment Initiative',
    source: 'Office of the Presidency',
    date: '2025',
    excerpt:
      'President Cyril Ramaphosa announces the fifth phase of the BEEI, South Africa\'s largest youth employment programme, placing 200,000 young people in schools as reading champions, curriculum assistants, and more.',
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
      {/* Cover story: Citizen of the Year (leads the page). pt clears the fixed navbar. */}
      <section className="pt-28 md:pt-36 pb-20 md:pb-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <FadeUp className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-[#C81E3C]" />
                <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Press Coverage</span>
              </div>
              <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
                Citizen of the Year,{' '}
                <span className="italic font-light text-[#C81E3C]">2025.</span>
              </h1>
              <p className="text-lg text-gray-600 mt-6 max-w-md">
                Masinyusane Executive Director Zama Zulu was named Citizen of the Year for
                her tireless work transforming early literacy and creating youth employment
                across South Africa.
              </p>
            </FadeUp>

            <FadeUp delay={0.1} className="lg:col-span-7">
              <div className="rounded-lg overflow-hidden shadow-xl aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/MqXxGNOeQtM"
                  title="Zama Zulu, Citizen of the Year 2025"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Press cards */}
      <section className="py-20 md:py-28 bg-[#FAF7F2]">
        <div className="container mx-auto px-4">
          <FadeUp className="max-w-2xl mb-14 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#C81E3C]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Selected coverage</span>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
              Recent{' '}
              <span className="italic font-light text-[#C81E3C]">coverage.</span>
            </h2>
            <p className="text-lg text-gray-600 mt-5">
              From the State of the Nation Address to local front pages, our work in early
              literacy and youth employment keeps making news.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((item, index) => (
              <FadeUp key={index} delay={0.1 * index}>
                <article className="group h-full flex flex-col bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5">
                  <div className="aspect-[16/10] overflow-hidden relative bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={640}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] mb-3">
                      <span className="font-semibold text-[#C81E3C]">{item.source}</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-gray-500">{item.date}</span>
                    </div>
                    <h3 className="font-serif text-xl leading-snug text-[#14181D] mb-3 group-hover:text-[#C81E3C] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {item.excerpt}
                    </p>
                    {item.link.endsWith('.pdf') ? (
                      <a
                        href={item.link}
                        download
                        className="mt-auto inline-flex items-center gap-1.5 text-[#C81E3C] font-medium hover:gap-2.5 transition-all"
                      >
                        Download report
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 text-[#C81E3C] font-medium hover:gap-2.5 transition-all"
                      >
                        Read article
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
