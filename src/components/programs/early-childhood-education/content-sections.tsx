import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';

interface ContentSectionProps {
  title: string;
  content: string;
  imageSrc: string;
  imageAlt: string;
  imageOnRight?: boolean;
}

function ContentSection({ title, content, imageSrc, imageAlt, imageOnRight = false }: ContentSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center py-16">
      {/* Text Content */}
      <div className={`space-y-6 ${imageOnRight ? 'md:order-1' : 'md:order-2'}`}>
        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          {content}
        </p>
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
      title: 'Early Childhood Development',
      content: 'We specialize in teaching children aged 2-9 how to read, write, and comprehend. The ability to read is the gateway to learning, forming the bedrock of a child\'s entire education. We are committed to ensuring that this foundation is strong, giving every child the tools they need to thrive academically and beyond.',
      imageSrc: '/images/Lit Session 5.jpg',
      imageAlt: 'Early Childhood Development',
      imageOnRight: true
    },
    {
      title: 'Teaching at the Right Level',
      content: 'We customize literacy sessions to the level the child is at, ensuring we maximize their learning and confidence while ensuring foundational skill mastery before moving on.',
      imageSrc: '/images/Lit Session 2.jpg',
      imageAlt: 'Teaching at the Right Level',
      imageOnRight: false
    },
    {
      title: 'Data Driven',
      content: 'We measure dozens of statistics on thousands of children, employing advanced analytics unique to the nonprofit sector. This allows us to prove overall program impact, project management with efficiency, continue to iterate through better and better versions of our programs, and to customize lessons for each school, classroom, and child.',
      imageSrc: '/images/Lit Session 6.jpg',
      imageAlt: 'Data Driven',
      imageOnRight: true
    },
    {
      title: 'Thousands of Stories',
      content: 'In addition to teaching children how to read, we strive to ensure every child hears 1,000 stories before the age of seven. Children who regularly hear stories develop stronger memories, expand their vocabularies, become more skilled readers, and nurture their imaginations, all while enhancing their critical thinking and problem-solving abilities, setting the stage for lifelong learning success.',
      imageSrc: '/images/Sandwater Primary - Literacy Session 2.jpg',
      imageAlt: 'Thousands of Stories',
      imageOnRight: false
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
              content={section.content}
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

