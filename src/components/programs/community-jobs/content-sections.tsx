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
      title: "Uplifting One's Own Community",
      paragraphs: [
        "Masinyusane's Youth Jobs initiative hires local youth, trains them in projects with proven methodologies, and unleashes them as assistants working in their local schools.",
        "We currently have over 350 local youth running one-on-two literacy sessions with children across four of our primary schools.",
        "The pride these youth, all of whom were previously unemployed, take in being a part of uplifting their own schools and children is impossible to overstate."
      ],
      imageSrc: '/images/youth-2.webp',
      imageAlt: "Uplifting One's Own Community",
      imageOnRight: true
    },
    {
      title: 'Earning an Income',
      paragraphs: [
        "All of our Youth were previously unemployed. The income they earn enables them to improve their own lives and uplift the quality of life of their own families.",
        "A wealth of research has highlighted the importance of having a job, especially one with a purpose, in terms of self-confidence and well being.",
        "In a country with one of the highest youth unemployment rates in the world, we are proud to be creating jobs and empowering these young people."
      ],
      imageSrc: '/images/youth-3.webp',
      imageAlt: 'Earning an Income',
      imageOnRight: false
    },
    {
      title: 'Training & Experience',
      paragraphs: [
        "One of the biggest barriers to employment is a lack of experience and training.",
        "Masinyusane's Youth jobs provide critical training and experience to local youth who otherwise have none.",
        "We have had many of these youth use the position as a stepping stone to jump up into full-time employment at other companies.",
        "We also have a number of them furthering their studies at night, benefiting from our scholarship fund to get the best education possible."
      ],
      imageSrc: '/images/youth-4.webp',
      imageAlt: 'Training & Experience',
      imageOnRight: true
    },
    {
      title: 'Community Leaders',
      paragraphs: [
        "There is incredible talent in our communities. There just aren't opportunities for it to be realized. Our team consistently blows us away with their energy, creativity, love and leadership.",
        "They are part of an army committed to improving their local schools, creating a generation of educated children, and creating a better future for the next generation.",
        "Helping one recognize the power and talent they possess is a sacred job. We are proud to play a small part in creating that opportunity for our youth."
      ],
      imageSrc: '/images/youth-5.webp',
      imageAlt: 'Community Leaders',
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

