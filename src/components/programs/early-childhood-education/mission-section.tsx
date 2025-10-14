export default function MissionSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left - Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Our <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Mission</span>
            </h2>
            <div className="space-y-4 text-lg text-gray-700">
              <p>
                To provide our all of our children with the superpower of reading, the self-confidence to prosper, and to instill a spirit of curiosity and learning.
              </p>
              <p>
                We take a data-driven and systematic approach to teaching children, step-by-step, at their pace and on their level, how to read.
              </p>
            </div>
          </div>

          {/* Right - Video */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/tj_W0jlFiPQ?si=jZsBVkX_TCUpidH8"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

