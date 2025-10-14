'use client';
import { FadeRight } from '@/components/animations/FadeAnimations';
import { FadeUp } from '@/components/animations/FadeAnimations';

export default function OurApproachStrip() {
    return (
        <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeRight>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                <h2 className="text-4xl font-bold mb-6">
                  Our <span className="font-light">Differentiated Approach</span>
                </h2>
                <p className="text-lg text-gray-700">
                  We leverage data, scale our programs, stay transparent, and empower communities for lasting impact.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Cards can have individual animations with delays */}
                <FadeUp delay={0.1}>
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h5 className="font-bold text-lg mb-2">Data-Driven</h5>
                    <p className="text-sm text-gray-600">We collect and analyze data to tailor our programs for maximum effectiveness and better outcomes.</p>
                  </div>
                </FadeUp>
                <FadeUp delay={0.2}>
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h5 className="font-bold text-lg mb-2">Scalable Solutions</h5>
                    <p className="text-sm text-gray-600">We design our interventions to be easily scalable, maximizing the impact of every contribution.</p>
                  </div>
                </FadeUp>
                <FadeUp delay={0.3}>
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                    <h5 className="font-bold text-lg mb-2">Complete Transparency</h5>
                    <p className="text-sm text-gray-600">We ensure transparency in our finances and operations, providing accountability to all stakeholders.</p>
                  </div>
                </FadeUp>
                <FadeUp delay={0.4}>
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h5 className="font-bold text-lg mb-2">Community Focused</h5>
                    <p className="text-sm text-gray-600">We empower local communities, creating opportunities and supporting self-driven growth.</p>
                  </div>
                </FadeUp>
              </div>
            </div>
          </FadeRight>
        </div>
      </section>
        
    )
}