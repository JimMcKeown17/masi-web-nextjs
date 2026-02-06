"use client";
import Image from "next/image";

// Stat card component
function StatCard({
  icon,
  mainText,
  description
}: {
  icon: string;
  mainText: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-6 px-4 md:px-8">
      <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24">
        <Image
          src={icon}
          alt=""
          width={96}
          height={96}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-left">
        <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-red-600 mb-1">
          {mainText}
        </p>
        <p className="text-sm md:text-base text-gray-700 max-w-[220px] uppercase font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function SolutionSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Eyebrow text */}
        <p className="text-center text-sm md:text-base font-semibold tracking-wider uppercase text-gray-500 mb-8">
          High Unemployment
        </p>

        {/* Main heading with gradient */}
        <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold mb-16 md:mb-20 max-w-5xl mx-auto leading-tight">
          <span className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            ...meanwhile South Africa has
          </span>
          <br />
          <span className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            the world's highest unemployment rate.
          </span>
        </h2>

        {/* Stats grid */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 md:divide-x divide-gray-300">
          <StatCard
            icon="/globe2.svg"
            mainText="#1"
            description="unemployment rate in the world"
          />
          <StatCard
            icon="/people.svg"
            mainText="81m"
            description="South Africans live on LESS THAN $2 A DAY"
          />
          <StatCard
            icon="/unemployed.svg"
            mainText="75%"
            description="of the unemployed ARE YOUTH"
          />
        </div>
      </div>
    </section>
  );
}

