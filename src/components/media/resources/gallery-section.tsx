'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUrl';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

const galleryImages = [
  { file: 'images/Graduates/Mihle Vika (2).webp', name: 'Mihle Vika' },
  { file: 'images/Graduates/Babalwa Otola (5).webp', name: 'Babalwa Otola' },
  { file: 'images/Graduates/Pontso Lekeba (5).webp', name: 'Pontso Lekeba' },
  { file: 'images/Graduates/Azama Zamani Graduation 2023 - edited (14).webp', name: 'Azama Zamani' },
  { file: 'images/Graduates/Mekyle Solomon (6).webp', name: 'Mekyle Solomon' },
  { file: 'images/Graduates/Amlindile Maneli.webp', name: 'Amlindile Maneli' },
  { file: 'images/Graduates/Pilani Nama (2).webp', name: 'Pilani Nama' },
  { file: 'images/Graduates/Sisipho Habane (12).webp', name: 'Sisipho Habane' },
  { file: 'images/Graduates/Esethu Ndlungwane (5).webp', name: 'Esethu Ndlungwane' },
  { file: 'images/Graduates/Nomaphelo IMG_2333-Enhanced-NR.webp', name: 'Nomaphelo' },
  { file: 'images/Graduates/Agcobile Mkwakwi (2).webp', name: 'Agcobile Mkwakwi' },
  { file: 'images/Graduates/Siphiwe Mabuya (6).webp', name: 'Siphiwe Mabuya' },
].map((g) => ({
  src: getImageUrl(g.file),
  alt: g.name,
}));

export default function GallerySection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1
    );
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      selectedIndex === galleryImages.length - 1 ? 0 : selectedIndex + 1
    );
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-yellow-400" />
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Photo Gallery
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet Our Graduates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The faces behind the numbers. Meet a few of the young superstars who are the future of our country.
          </p>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={400}
                height={400}
                className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/30 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <span className="text-white text-sm font-semibold">{image.alt}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox dialog */}
        <Dialog
          open={selectedIndex !== null}
          onOpenChange={(open) => !open && setSelectedIndex(null)}
        >
          <DialogContent className="max-w-5xl p-0 bg-black/95 border-none gap-0">
            <DialogTitle className="sr-only">
              {selectedIndex !== null
                ? galleryImages[selectedIndex].alt
                : 'Gallery image'}
            </DialogTitle>
            <DialogClose className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <X className="h-5 w-5 text-white" />
            </DialogClose>

            {selectedIndex !== null && (
              <div className="relative flex items-center justify-center min-h-[60vh]">
                {/* Previous button */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                {/* Image */}
                <div className="px-16 py-8">
                  <Image
                    src={galleryImages[selectedIndex].src}
                    alt={galleryImages[selectedIndex].alt}
                    width={1200}
                    height={800}
                    className="max-h-[75vh] w-auto mx-auto object-contain rounded"
                  />
                  <p className="text-white/70 text-center mt-4 text-sm">
                    {galleryImages[selectedIndex].alt}
                  </p>
                </div>

                {/* Next button */}
                <button
                  onClick={handleNext}
                  className="absolute right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
