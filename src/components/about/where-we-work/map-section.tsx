'use client';
import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { Marker } from 'react-map-gl/maplibre';
import { FadeUp } from '@/components/animations/FadeAnimations';
import CountUp from '@/components/animations/count-up';

interface School {
  name: string;
  lat: number;
  lon: number;
}

interface MapSectionProps {
  schools?: School[];
}

export default function MapSection({ schools = [] }: MapSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#C81E3C]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">On the ground</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D] mb-5">
            Where we <span className="italic font-light text-[#C81E3C]">work.</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Masinyusane works in over 150 schools and preschools across the Eastern
            Cape, South Africa&apos;s most impoverished region, serving some of the most
            impoverished children on earth.
          </p>
        </FadeUp>
      </div>

      {/* Interactive map (desktop) */}
      <FadeUp className="hidden md:block">
        <div className="w-full px-4">
          <div className="h-[640px] w-full max-w-[1400px] mx-auto rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-sm">
            <Map
              initialViewState={{ latitude: -33.96, longitude: 25.6, zoom: 9 }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            >
              {schools.map((school, index) => (
                <Marker key={index} longitude={school.lon} latitude={school.lat} color="#C81E3C" />
              ))}
            </Map>
          </div>
        </div>
      </FadeUp>

      {/* Mobile fallback: map libraries are heavy and fiddly on phones, so show the headline stat instead */}
      <div className="md:hidden container mx-auto px-4">
        <div className="rounded-2xl bg-[#FAF7F2] p-8 text-center">
          <span className="font-serif block text-6xl font-medium text-[#C81E3C]">
            <CountUp to={150} suffix="+" />
          </span>
          <p className="text-gray-600 mt-2">schools and preschools across the Eastern Cape</p>
        </div>
      </div>
    </section>
  );
}
