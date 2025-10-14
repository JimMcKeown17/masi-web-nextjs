"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Typewriter from "typewriter-effect";
import { FadeLeft } from "@/components/animations/FadeAnimations";
import { getImageUrl } from "@/lib/imageUrl";
import { Card } from "@/components/ui/card";

export default function SolutionSection() {
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    // Start typing after 8.5 seconds to match the original timing
    const timer = setTimeout(() => {
      setStartTyping(true);
    }, 8500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-16 md:py-20 mb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-1 md:order-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 min-h-[120px]">
              {startTyping && (
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .typeString("Or that South Africa has the world's highest unemployment rate?")
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
              )}
            </h2>
          </div>
          <div className="order-2 md:order-2 flex justify-center">
            <FadeLeft>
              <Card className="overflow-hidden p-0 max-w-md">
                <Image
                  src={getImageUrl("images/the problem 6.png")}
                  alt="The Solution"
                  width={500}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </Card>
            </FadeLeft>
          </div>
        </div>
      </div>
    </section>
  );
}

