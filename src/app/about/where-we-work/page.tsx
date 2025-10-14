"use client";
import EasternCapeBanner from "@/components/about/where-we-work/eastern-cape-banner";
import ProblemSection from "@/components/about/where-we-work/problem-section";
import SolutionSection from "@/components/about/where-we-work/solution-section";
import SolutionDetails from "@/components/about/where-we-work/solution-details";
import MapSection from "@/components/about/where-we-work/map-section";
import Footer from "@/components/layout/Footer";

// Add your school locations here
const schools = [
  { name: "Sunshine Primary", lat: -33.956, lon: 25.606 },
  // Add more schools as needed
  // { name: "School Name", lat: -33.xxx, lon: 25.xxx },
];

export default function WhereWeWorkPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Eastern Cape Banner */}
      <EasternCapeBanner />

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

