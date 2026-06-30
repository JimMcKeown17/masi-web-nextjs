import type { Metadata } from "next";

import { ComingSoon } from "@/components/impact/data-portal/ComingSoon";
import { programmeBySlug } from "@/components/impact/data-portal/portalConfig";

const programme = programmeBySlug("1000-stories")!;

export const metadata: Metadata = {
  title: programme.label,
  description: `${programme.label} reach for the Masinyusane Impact Data Portal. Coming soon.`,
};

export default function ThousandStoriesPage() {
  return <ComingSoon programme={programme.label} accent={programme.accent} />;
}
