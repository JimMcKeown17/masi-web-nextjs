import { Hero } from "@/components/data-map/Hero";
import { MentalModel } from "@/components/data-map/MentalModel";
import { WorkedExample } from "@/components/data-map/WorkedExample";
import { SystemMap } from "@/components/data-map/SystemMap";
import { BackendDetail } from "@/components/data-map/BackendDetail";
import { KeySpine } from "@/components/data-map/KeySpine";
import { DashboardGrid } from "@/components/data-map/DashboardGrid";
import { Stewardship } from "@/components/data-map/Stewardship";
import { NextChapter } from "@/components/data-map/NextChapter";

// The Data Map: a leadership-facing visual of how data flows from capture
// tools through the two canonical backends to the dashboards. Entirely
// static; all content comes from src/lib/data-map/config.ts.
export default function DataMapPage() {
  return (
    <main>
      <Hero />
      <MentalModel />
      <WorkedExample />
      <SystemMap />
      <BackendDetail />
      <KeySpine />
      <DashboardGrid />
      <Stewardship />
      <NextChapter />
    </main>
  );
}
