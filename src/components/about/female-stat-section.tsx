import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

const employeeImages = [
  'images/LCs/LC-1.jpg',
  'images/LCs/LC-10.jpg',
  'images/LCs/LC-3.jpg',
  'images/LCs/LC-11.jpg',
  'images/LCs/LC-5.jpg',
  'images/LCs/LC-12.jpg',
  'images/LCs/LC-2.jpg',
  'images/LCs/LC-13.jpg',
  'images/LCs/LC-4.jpg'
];

export default function FemaleStatSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col justify-center md:justify-start">
            <div className="inline-block mb-2 text-center md:text-left">
              <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                Employees
              </span>
            </div>
            <p className="text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center md:text-left">
              95% of our employees are{' '}
              <span className="font-bold text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">
                female
              </span>
              .
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {employeeImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-lg shadow-md group"
              >
                <Image
                  src={getImageUrl(image)}
                  alt={`Employee ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

