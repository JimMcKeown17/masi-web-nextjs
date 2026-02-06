"use client";
import { BookOpen, Blocks, Home } from "lucide-react";

// Circular progress component
function CircularProgress({ percentage, icon: Icon }: { percentage: number; icon: React.ElementType }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative w-40 h-40 md:w-44 md:h-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#dc2626"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-10 h-10 md:w-12 md:h-12 text-red-600" />
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
  percentage,
  icon,
  description
}: {
  percentage: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="flex items-center gap-6 px-4 md:px-8">
      <CircularProgress percentage={percentage} icon={icon} />
      <div className="text-left">
        <p className="text-5xl md:text-6xl lg:text-7xl font-bold text-red-600 mb-2">
          {percentage}%
        </p>
        <p className="text-sm md:text-base text-gray-700 max-w-[220px]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ProblemSection() {
  return (
    <section className="relative py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Eyebrow text */}
        <p className="text-center text-sm md:text-base font-semibold tracking-wider uppercase text-gray-500 mb-8">
          Education Crisis
        </p>

        {/* Main heading with gradient */}
        <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold mb-16 md:mb-20 max-w-5xl mx-auto leading-tight">
          <span className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            81% of 10-year old
          </span>
          <br />
          <span className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            children in South Africa cannot read...
          </span>
        </h2>

        {/* Stats grid */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 md:divide-x divide-gray-300">
          <StatCard
            percentage={81}
            icon={BookOpen}
            description="of South African Children CANNOT read"
          />
          <StatCard
            percentage={75}
            icon={Blocks}
            description="of South African Children DO NOT get a preschool education"
          />
          <StatCard
            percentage={56}
            icon={Home}
            description="of South African homes HAVE NO BOOKS"
          />
        </div>
      </div>
    </section>
  );
}

