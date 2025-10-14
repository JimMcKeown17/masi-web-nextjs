"use client";

export default function EasternCapeBanner() {
  return (
    <section 
      className="relative h-[60vh] w-full text-white flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('https://storage.googleapis.com/masi-website/images/Eastern-Cape-3.JPG')"
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Eastern Cape, South Africa
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl">
          A land of beautiful, talented people plagued by poverty.
        </p>
      </div>
    </section>
  );
}

