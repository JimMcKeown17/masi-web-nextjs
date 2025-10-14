"use client";
import Image from "next/image";
import { FadeUp, FadeLeft } from "@/components/animations/FadeAnimations";
import { getImageUrl } from "@/lib/imageUrl";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SolutionDetails() {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <FadeUp>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                We Are Solving Both Problems
              </h1>
              <h4 className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
                We hire women from the local communities, train them, and deploy
                them as reading coaches in schools and preschools.
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    Women get their first job, receiving training, and are on the economic ladder.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    Families are now receiving incomes.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    Children are taught to read and write, thus unlocking their ability to learn in all other subjects.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    Children hear 1,000 stories before age 7, supercharging their vocabulary, imagination, and memory.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    Children&apos;s confidence soars.
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <FadeLeft>
                <Card className="overflow-hidden p-0">
                  <Image
                    src={getImageUrl("images/the-solution-model.png")}
                    alt="The Solution Model"
                    width={600}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                </Card>
              </FadeLeft>
            </div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

