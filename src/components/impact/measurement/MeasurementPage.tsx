import { PublishedStatsPayload } from "@/lib/types/impact";
import Footer from "@/components/layout/Footer";
import { GoDeeper } from "@/components/impact/dashboard/GoDeeper";

import { MeasurementHero } from "./MeasurementHero";
import { EvidenceStreams } from "./EvidenceStreams";
import { Triangulation } from "./Triangulation";
import { DataCycle } from "./DataCycle";
import { AssessmentFramework } from "./AssessmentFramework";
import { BenchmarkContext } from "./BenchmarkContext";
import { DataInfrastructure } from "./DataInfrastructure";
import { QualityPrivacy } from "./QualityPrivacy";
import { LearningAgenda } from "./LearningAgenda";

// Sibling to the Impact Dashboard: the credibility engine. Same Ink & Signal
// language, no cinematic moment. Mostly editorial (how we measure), so only the
// real proof-numbers (0.93 correlation, PIRLS 81%) come from the published-stats
// store; everything else is descriptive methodology content.
export function MeasurementPage({ payload }: { payload: PublishedStatsPayload | null }) {
  return (
    <div className="min-h-screen bg-white">
      <MeasurementHero />
      <EvidenceStreams />
      <Triangulation payload={payload} />
      <DataCycle />
      <AssessmentFramework />
      <BenchmarkContext payload={payload} />
      <DataInfrastructure />
      <QualityPrivacy />
      <LearningAgenda />
      <GoDeeper />
      <Footer />
    </div>
  );
}
