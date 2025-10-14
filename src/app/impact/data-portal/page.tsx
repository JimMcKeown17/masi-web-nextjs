'use client';

export default function DataPortalPage() {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Full-screen iframe */}
      <iframe
        src="https://data.masinyusane.org"
        title="Masinyusane Data Portal"
        className="w-full flex-1 border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="eager"
      />
    </div>
  );
}

