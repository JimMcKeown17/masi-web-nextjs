import type { Metadata } from "next";

import { MeasurementPage } from "@/components/impact/measurement/MeasurementPage";
import { getPublishedStats } from "@/lib/api/impact/published-stats";

export const metadata: Metadata = {
  title: "How We Measure Impact | Masinyusane",
  description:
    "Monitoring, evaluation and data at Masinyusane: three independent evidence streams, a validated assessment framework, and a live data system that measures learning, not just activity.",
};

export default async function MeasurementRoute() {
  const payload = await getPublishedStats();

  return <MeasurementPage payload={payload} />;
}
