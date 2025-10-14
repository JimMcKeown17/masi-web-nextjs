export default function MissionSection() {
  return (
    <section className="py-16 md:py-24">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Our <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Mission</span>
          </h2>
        </div>
        <div>
          <p className="text-lg mb-4">
            Masinyusane creates opportunities for impoverished children and youth to get the best education possible. We invest in high-impact education projects that empower the local community to uplift itself.
          </p>
          <p className="text-lg">
            We are simultaneously creating a generation of leaders now while investing in the long-term future of South Africa's children.
          </p>
        </div>
      </div>
    </div>
  </section>
  );
}