import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';

interface ContentSectionProps {
  title: string;
  paragraphs: string[];
  imageSrc: string;
  imageAlt: string;
  imageOnRight?: boolean;
}

function ContentSection({ title, paragraphs, imageSrc, imageAlt, imageOnRight = false }: ContentSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center py-16">
      {/* Text Content */}
      <div className={`space-y-6 ${imageOnRight ? 'md:order-1' : 'md:order-2'}`}>
        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-lg text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Image */}
      <div className={`relative ${imageOnRight ? 'md:order-2' : 'md:order-1'}`}>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
          <div className="relative aspect-[4/3]">
            <Image
              src={getImageUrl(imageSrc)}
              alt={imageAlt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );
}

export default function ContentSections() {
  const sections = [
    {
      title: 'Girls Scholarship Fund',
      paragraphs: [
        "Girls do more to uplift their families and communities than men. This is well established. They are also provided far fewer opportunities in this world than their male counterparts.",
        "In recognition of above, Masinyusane has invested millions of rand in sending talented young female students to university and creating a generation of female leaders.",
        "We are impossibly proud of these young woman and look forward to seeing them enter fields ranging from Engineering to Law."
      ],
      imageSrc: '/images/tl-photo-1.webp',
      imageAlt: 'Girls Scholarship Fund',
      imageOnRight: true
    },
    {
      title: 'Tuition Scholarships',
      paragraphs: [
        "Masinyusane's scholarship fund ensures that all learners qualifying from university from Port Elizabeth's 35 township high schools has the opportunity to continue their education.",
        "Our mission is to flood the township with graduates empowered to uplift their own families, solve their own community's problems and serve as role models to their own youth."
      ],
      imageSrc: '/images/tl-photo-2.webp',
      imageAlt: 'Tuition Scholarships',
      imageOnRight: false
    },
    {
      title: 'Food, Transport, & Housing',
      paragraphs: [
        "Our students lack access to more than just tuition. They are unable to borrow funds to live on campus, are forced to live in crowded, impoverished homes and commute more than an hour each day.",
        "Many struggle to find bus fare and few eat during the day. To combat this, Masinyusane distributes food and bus fare stipends every week.",
        "We also run two Masinyusane Houses of Excellence that provide free, safe housing to our most impoverished students."
      ],
      imageSrc: '/images/tl-photo-3.webp',
      imageAlt: 'Food, Transport, & Housing',
      imageOnRight: true
    },
    {
      title: 'Mentoring & Guidance',
      paragraphs: [
        "Many of our students struggle with the transition from all-Xhosa high schools to multi-cultural, English-speaking universities. This is compounded by no longer being the big fish in the small pond.",
        "In response, our team of mentors work closely with our students every day to ensure they receive the support, motivation, love and guidance needed to navigate their studies and the inevitable tough times."
      ],
      imageSrc: '/images/tl-photo-4.webp',
      imageAlt: 'Mentoring & Guidance',
      imageOnRight: false
    },
    {
      title: 'Applications',
      paragraphs: [
        "Masinyusane runs a massive logistics operation ensuring learners from all 35 Port Elizabeth township high schools are applying on-time, and correctly, to universities, financial aid, and scholarships.",
        "This process is expensive, confusing, and time-consuming. Years ago, our needs analysis showed that only 14% of our Top Learners were applying for university correctly and on-time.",
        "With our assistance, that number is now over 90% every year."
      ],
      imageSrc: '/images/tl-photo-5.webp',
      imageAlt: 'Applications',
      imageOnRight: true
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {sections.map((section, index) => (
            <ContentSection
              key={index}
              title={section.title}
              paragraphs={section.paragraphs}
              imageSrc={section.imageSrc}
              imageAlt={section.imageAlt}
              imageOnRight={section.imageOnRight}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

