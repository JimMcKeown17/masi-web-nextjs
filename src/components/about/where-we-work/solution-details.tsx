"use client";
import { Briefcase, DollarSign, BookOpen, Sparkles } from "lucide-react";

// Benefit card component
function BenefitCard({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/80 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2.5} />
      </div>
      <p className="text-white text-sm md:text-base max-w-[280px]">
        {text}
      </p>
    </div>
  );
}

export default function SolutionDetails() {
  return (
    <section className="py-16 md:py-24 bg-[#7CB342]">
      <div className="container mx-auto px-4">
        {/* Eyebrow text */}
        <p className="text-center text-sm md:text-base font-semibold tracking-wider uppercase text-white/90 mb-8">
          Two Birds, One Stone
        </p>

        {/* Main heading - BIG and POWERFUL */}
        <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-5xl mx-auto leading-tight">
          Two Crises. One Solution.
        </h1>

        {/* Subtext */}
        <p className="text-center text-lg md:text-xl text-white/95 mb-16 md:mb-20 max-w-4xl mx-auto leading-relaxed">
          We hire unemployed women and train them as reading & numeracy coaches in schools and preschools.
        </p>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 max-w-6xl mx-auto">
          <BenefitCard
            icon={Briefcase}
            text="Women enter their first jobs, gaining skills and income."
          />
          <BenefitCard
            icon={DollarSign}
            text="Families are now receiving incomes."
          />
          <BenefitCard
            icon={BookOpen}
            text="Children learn to read and write, unlocking all learning."
          />
          <BenefitCard
            icon={Sparkles}
            text="By age seven, children hear 1,000 stories, boosting vocabulary and imagination."
          />
        </div>
      </div>
    </section>
  );
}

