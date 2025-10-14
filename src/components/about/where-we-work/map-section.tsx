"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import { FadeUp } from "@/components/animations/FadeAnimations";

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
    <section className="hidden md:block py-12">
      <div className="container-fluid px-0">
        <FadeUp>
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              Where We Work
            </h2>
            <p className="text-center text-gray-700 text-lg mb-8 max-w-3xl mx-auto">
              Masi works in over 150 schools and preschools in South Africa&apos;s most
              impoverished region. The children we support are amongst the most
              impoverished on earth.
            </p>
          </div>
          <div className="w-full px-4">
            <div className="h-[650px] w-full rounded-lg overflow-hidden shadow-lg">
              <Map
                initialViewState={{
                  latitude: -33.96,
                  longitude: 25.6,
                  zoom: 9,
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              >
                {schools.map((school, index) => (
                  <Marker
                    key={index}
                    longitude={school.lon}
                    latitude={school.lat}
                    color="red"
                  />
                ))}
              </Map>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

