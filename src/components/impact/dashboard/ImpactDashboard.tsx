import { PublishedStatsPayload } from "@/lib/types/impact";

import { ArgumentChain } from "./ArgumentChain";
import { ChildProfile } from "./ChildProfile";
import { ClassroomLights } from "./ClassroomLights";
import { EcdParity } from "./EcdParity";
import { GoDeeper } from "./GoDeeper";
import { GovPartner } from "./GovPartner";
import { Graduates } from "./Graduates";
import { HeroSection } from "./HeroSection";
import { HowWeKnow } from "./HowWeKnow";
import { MoreResults } from "./MoreResults";
import { NumeracySnapshot } from "./NumeracySnapshot";
import { ScaleStory } from "./ScaleStory";
import Footer from "@/components/layout/Footer";

export function ImpactDashboard({ payload }: { payload: PublishedStatsPayload | null }) {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection payload={payload} />
      <ArgumentChain payload={payload} />
      <ClassroomLights payload={payload} />
      <EcdParity payload={payload} />
      {/* Real, consented child profile: Zanothando Mhlanga, Grade R, Isaac Booi Primary. */}
      <ChildProfile />
      <NumeracySnapshot payload={payload} />
      <ScaleStory />
      <GovPartner />
      <Graduates payload={payload} />
      <HowWeKnow />
      <MoreResults payload={payload} />
      <GoDeeper />
      <Footer />
    </div>
  );
}
