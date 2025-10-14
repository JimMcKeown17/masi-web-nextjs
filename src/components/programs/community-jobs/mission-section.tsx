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
            <p className="text-lg text-gray-700 leading-relaxed">
              To empower the local community to uplift itself by creating meaningful jobs in which previously unemployed youth are hired to work in creches, preschools and primary schools teaching children to read, write and comprehend.
            </p>
          </div>

          {/* Right - Video */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/5j2d6nlFVe8?si=SnKeKovAw1gauiS2"
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

