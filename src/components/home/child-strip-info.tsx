'use client';
import { FadeUp } from '@/components/animations/FadeAnimations';

export default function ChildStripInfo() {
    return (
        <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Early <span className="font-light">Childhood Education</span>
              </h2>
              <h6 className="text-xl text-gray-700 mb-6">
                Providing children with the education they deserve.
              </h6>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.youtube.com/watch?v=5j2d6nlFVe8&t=3s" target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition">
                  Video
                </a>
                <a href="/data" className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-md hover:bg-red-50 transition">
                  Data Portal
                </a>
              </div>
            </div>
            <div>
              <p className="text-lg mb-4">
                We implement data-driven children's literacy programmes, with a major focus on literacy and numeracy. We invest in Teaching at the Right Level programmes, providing children with customised, individual lessons designed to provide them with the educational foundation that they deserve.
              </p>
              <p className="text-lg">
                Our focus is on children aged 2 - 13, with the most attention going to the youngest children.
              </p>
            </div>
          </div>

          {/* Stats - stagger them for a nice effect */}
          <div className="hidden md:grid grid-cols-4 gap-8 mt-16">
            <FadeUp delay={0.1}>
              <div className="pl-6">
                <h2 className="text-5xl font-bold text-red-600 mb-2">2x</h2>
                <p className="text-gray-700">Children on the program learn to read twice as fast as children that are not.</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-5xl font-bold text-red-600 mb-2">400%</h2>
                <p className="text-gray-700">Preschool children drastically outperform control groups on literacy basics tests.</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-5xl font-bold text-red-600 mb-2">43%</h2>
                <p className="text-gray-700">On average, our primary school age children outperform peers by 43% YoY.</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-5xl font-bold text-red-600 mb-2">18756</h2>
                <p className="text-gray-700">Children are participating in our literacy & reading projects in 2024</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
        
    )
}