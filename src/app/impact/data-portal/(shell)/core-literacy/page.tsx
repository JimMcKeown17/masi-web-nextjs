import type { Metadata } from "next";

import { ComingSoon } from "@/components/impact/data-portal/ComingSoon";
import { programmeBySlug } from "@/components/impact/data-portal/portalConfig";

const programme = programmeBySlug("core-literacy")!;

export const metadata: Metadata = {
  title: programme.label,
  description: `${programme.label} headline results for the Masinyusane Impact Data Portal. Coming soon.`,
};

export default function CoreLiteracyPage() {
  return <ComingSoon programme={programme.label} accent={programme.accent} />;
}
