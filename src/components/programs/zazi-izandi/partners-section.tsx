import Image from 'next/image';

const partners = [
  {
    name: 'Masinyusane',
    src: '/zazi-izandi/sponsors/Masi Logo.png',
    width: 160,
  },
  {
    name: 'TLT',
    src: '/zazi-izandi/sponsors/TLT logo.png',
    width: 120,
  },
  {
    name: 'Department of Education Eastern Cape',
    src: '/zazi-izandi/sponsors/DoE EC Logo.png',
    width: 140,
  },
  {
    name: 'DGMT',
    src: '/zazi-izandi/sponsors/dgmt-orange.png',
    width: 120,
  },
  {
    name: 'Funda Wande',
    src: '/zazi-izandi/sponsors/Funda Wande Logo-t.png',
    width: 160,
  },
  {
    name: 'Gates Foundation',
    src: '/zazi-izandi/sponsors/gates-foundation-logo-t74.png',
    width: 140,
  },
  {
    name: 'Click Learning',
    src: '/zazi-izandi/sponsors/click-logo.gif',
    width: 120,
  },
  {
    name: 'BLC',
    src: '/zazi-izandi/sponsors/bcl-logo.jpeg',
    width: 120,
  },
  {
    name: 'Allan Gray Foundation',
    src: '/zazi-izandi/sponsors/allan-gray-foundation.png',
    width: 160,
  },
  {
    name: 'Teampact',
    src: '/zazi-izandi/sponsors/teampact-logo.png',
    width: 140,
  },
];

export default function ZaziPartnersSection() {
  return (
    <section className="py-14 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-10">
          Partners & Supporters
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={60}
                className="object-contain h-12 w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
