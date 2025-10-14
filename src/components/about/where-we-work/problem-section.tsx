"use client";
import Image from "next/image";
import Typewriter from "typewriter-effect";
import { FadeRight } from "@/components/animations/FadeAnimations";
import { getImageUrl } from "@/lib/imageUrl";
import { Card } from "@/components/ui/card";

export default function ProblemSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1 flex justify-center">
            <FadeRight>
              <Card className="overflow-hidden p-0 max-w-md">
                <Image
                  src={getImageUrl("images/the problem 2.png")}
                  alt="The Problem"
                  width={500}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </Card>
            </FadeRight>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 min-h-[120px]">
              <Typewriter
                onInit={(typewriter) => {
                  typewriter
                    .typeString("Did You Know?")
                    .pauseFor(2000)
                    .deleteAll(20)
                    .typeString("That 81% of 10-year old children in South Africa cannot read.")
                    .pauseFor(1000)
                    .callFunction(() => {
                      const cursor = document.querySelector('.Typewriter__cursor');
                      if (cursor) {
                        (cursor as HTMLElement).style.display = 'none';
                      }
                    })
                    .start();
                }}
                options={{
                  delay: 50,
                  cursor: "|",
                }}
              />
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

