"use client";
import { useState, useEffect } from "react";
import EasternCapeBanner from "@/components/about/where-we-work/eastern-cape-banner";
import ProblemSection from "@/components/about/where-we-work/problem-section";
import SolutionSection from "@/components/about/where-we-work/solution-section";
import SolutionDetails from "@/components/about/where-we-work/solution-details";
import MapSection from "@/components/about/where-we-work/map-section";
import Footer from "@/components/layout/Footer";

interface School {
  name: string;
  lat: number;
  lon: number;
}

// Parse CSV text into school objects
function parseSchoolsCSV(csvText: string): School[] {
  const lines = csvText.split('\n');
  const schools: School[] = [];

  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by comma, handling quoted fields
    const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 5) continue;

    const schoolName = matches[0].replace(/^"(.*)"$/, '$1'); // Remove quotes if present
    const lat = parseFloat(matches[3]);
    const lon = parseFloat(matches[4]);

    // Only add schools with valid coordinates
    if (!isNaN(lat) && !isNaN(lon)) {
      schools.push({
        name: schoolName,
        lat,
        lon
      });
    }
  }

  return schools;
}

export default function WhereWeWorkPage() {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    // Fetch and parse the CSV file
    fetch('/masi_schools_feb26.csv')
      .then(response => response.text())
      .then(csvText => {
        const parsedSchools = parseSchoolsCSV(csvText);
        setSchools(parsedSchools);
      })
      .catch(error => {
        console.error('Error loading schools data:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Negative margin pulls hero under the fixed navbar so it fills the full viewport */}
      <div className="-mt-16">
        <EasternCapeBanner />
      </div>

      {/* The Problem Section */}
      <ProblemSection />

      {/* The Solution Section */}
      <SolutionSection />

      {/* Solution Details */}
      <SolutionDetails />

      {/* Map Section */}
      <MapSection schools={schools} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

