"use client";

import { useEffect, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";

interface School {
  name: string;
  lat: number;
  lon: number;
}

// Same CSV + parser the Where We Work map uses (public/masi_schools_feb26.csv).
function parseSchoolsCSV(csvText: string): School[] {
  const lines = csvText.split("\n");
  const schools: School[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 5) continue;
    const lat = parseFloat(matches[3]);
    const lon = parseFloat(matches[4]);
    if (!isNaN(lat) && !isNaN(lon)) {
      schools.push({ name: matches[0].replace(/^"(.*)"$/, "$1"), lat, lon });
    }
  }
  return schools;
}

// The real Masinyusane site map, restyled for the deep-ink section: Carto dark-matter
// basemap, lifted-blue glowing markers. Maps are heavy on phones, so the parent renders
// a lightweight fallback at small widths and only mounts this on md+.
export function ScaleMap() {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    fetch("/masi_schools_feb26.csv")
      .then((response) => response.text())
      .then((csvText) => setSchools(parseSchoolsCSV(csvText)))
      .catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0">
      <Map
        // Zoom in on Gqeberha. Center sits north-west of the city so Gqeberha (and its
        // school cluster) lands in the lower-right and the frame fills with land, not ocean.
        initialViewState={{ latitude: -33.82, longitude: 25.44, zoom: 9.2 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
        dragRotate={false}
      >
        {schools.map((school, index) => (
          <Marker key={index} longitude={school.lon} latitude={school.lat}>
            <span
              className="block h-[7px] w-[7px] rounded-full"
              style={{ background: "#5B8DEF", boxShadow: "0 0 8px rgba(91,141,239,0.9)" }}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
