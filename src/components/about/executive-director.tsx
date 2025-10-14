import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { Award, Play } from 'lucide-react';

export default function ExecutiveDirector() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 text-center">
            <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto rounded-full overflow-hidden shadow-xl">
              <Image
                src={getImageUrl('images/Zama Zulu.png')}
                alt="Zama Zulu - Executive Director"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-8 text-center md:text-left">
            <div className="inline-block mb-2">
              <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                Leadership
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-1">
              Zama <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Zulu</span>
            </h2>
            <p className="text-base text-gray-600 mb-3">Executive Director, South Africa</p>
            
            {/* Award Banner and Video Button */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-full shadow-md">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-yellow-700 to-yellow-900 bg-clip-text text-transparent">
                  2025 Citizen of the Year
                </span>
              </div>
              
              <a 
                href="https://www.youtube.com/watch?v=MqXxGNOeQtM&t=8s" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-700 hover:to-rose-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-25"></div>
                  <Play className="w-4 h-4 fill-white relative" />
                </div>
                <span className="text-sm">Watch Award Video</span>
              </a>
            </div>
            
            <p className="text-base mb-3">
              Zama, our Executive Director, brings a wealth of experience and passion to our organization.
              With an educational background in accounting, Zama has excelled in the corporate landscape of
              South Africa, contributing to the growth of numerous leading companies throughout his career.
            </p>
            <p className="text-base">
              As a successful entrepreneur, Zama has demonstrated an exceptional ability to innovate and lead.
              His unwavering dedication to fostering the development of a new generation of leaders is at the
              heart of his work at Masinyusane.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

