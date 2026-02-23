interface MediaHeroProps {
  title: string;
  subtitle: string;
  label: string;
}

export default function MediaHeroSection({ title, subtitle, label }: MediaHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-28 overflow-hidden">
      {/* Dot texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      <div className="container relative z-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-1 bg-yellow-400" />
          <span className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
            {label}
          </span>
          <div className="w-8 h-1 bg-yellow-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">{title}</h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}
