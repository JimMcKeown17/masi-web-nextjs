'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';


export default function YouthStripInfo() {
    return (
        <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-block mb-3">
                <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                  Employment Initiative
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Community <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Jobs</span>
              </h2>
              <h6 className="text-lg text-gray-600 mb-2">Empowering a community to uplift itself.</h6>
              <h6 className="text-lg text-gray-600 mb-6">Local jobs in local schools.</h6>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.youtube.com/watch?v=5j2d6nlFVe8&t=3s" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-md hover:from-blue-600 hover:to-blue-700 transition">
                  Video
                </a>
                <a href="/data" className="border-2 border-blue-600 bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text text-transparent px-8 py-3 rounded-md hover:bg-blue-50 transition">
                  Data Portal
                </a>
              </div>
            </div>
            <div>
              <p className="text-lg mb-4">
                We create jobs for previously unemployed community youth and put them to work in libraries and literacy centers that we build in impoverished early childhood development centres, preschools, and primary schools.
              </p>
              <p className="text-lg">
                Using proven methodologies, our literacy coaches provide children with one-on-one literacy coaching for the first 5-7 years of their schooling life. All day. Every day.
              </p>
            </div>
          </div>

          {/* Stats with stagger */}
          <div className="hidden md:grid grid-cols-4 gap-8 mt-16">
            <FadeUp delay={0.1}>
              <div className="pl-6">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text text-transparent mb-2">92%</h2>
                <p className="text-gray-700">of our jobs go to women.</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text text-transparent mb-2">1964</h2>
                <p className="text-gray-700">Previously unemployed youth have received jobs</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text text-transparent mb-2">43%</h2>
                <p className="text-gray-700">Highest youth unemployment rate in the world.</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text text-transparent mb-2">75%</h2>
                <p className="text-gray-700">of South Africans are unemployed.</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
        
    )
}