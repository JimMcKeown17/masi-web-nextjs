import type { Metadata } from "next";

import { ZaziProgrammatic } from "@/components/impact/data-portal/ZaziProgrammatic";
import { getZaziProgrammatic } from "@/lib/api/impact/zazi-programmatic";

export const metadata: Metadata = {
  title: "Zazi iZandi",
  description:
    "Funder-facing Zazi iZandi programme results, recomputed from the assessment database and stamped with the date read. Baseline to midline letter-sound movement against a matched control group and the national benchmark.",
};

export default async function ZaziIzandiPage() {
  const payload = await getZaziProgrammatic();

  return <ZaziProgrammatic payload={payload} />;
}
