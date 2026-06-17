import type { Metadata } from "next";

import { ImpactDashboard } from "@/components/impact/dashboard/ImpactDashboard";
import { getPublishedStats } from "@/lib/api/impact/published-stats";

export const metadata: Metadata = {
  title: "Impact Dashboard Preview | Masinyusane",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ImpactDashboardPreviewPage() {
  const payload = await getPublishedStats();

  return <ImpactDashboard payload={payload} />;
}
