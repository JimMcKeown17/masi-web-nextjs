'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';

export default function ScholarshipStripInfo() {
    return (
        <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-block mb-3">
                <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                  Higher Education
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Scholarship <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Fund</span>
              </h2>
              <h6 className="text-lg text-gray-600 mb-6">Investing in a generation of future leaders.</h6>
              <a href="https://www.youtube.com/watch?v=QUfevyYW1H8" target="_blank" rel="noopener noreferrer" className="border-2 border-yellow-500 text-yellow-600 px-8 py-3 rounded-md hover:bg-yellow-50 transition inline-block">
                Video
              </a>
            </div>
            <div>
              <p className="text-lg mb-4">What would happen if you flooded South Africa's most impoverished communities with university graduates?</p>
              <p className="text-lg mb-4">We are going to find out.</p>
              <p className="text-lg">These young leaders are becoming empowered to uplift their own families, solve their own community's problems, and to serve as role models to other youth.</p>
            </div>
          </div>

          {/* Stats with stagger */}
          <div className="hidden md:grid grid-cols-4 gap-8 mt-16">
            <FadeUp delay={0.1}>
              <div className="pl-6">
                <h2 className="text-5xl font-bold text-yellow-600 mb-2">10,000+</h2>
                <p className="text-gray-700">High school learners assisted</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-5xl font-bold text-yellow-600 mb-2">88%</h2>
                <p className="text-gray-700">Pass-rate</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-5xl font-bold text-yellow-600 mb-2">259</h2>
                <p className="text-gray-700">Employed graduates</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-5xl font-bold text-yellow-600 mb-2">1,000</h2>
                <p className="text-gray-700">University graduates by 2028</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
        
    )
}