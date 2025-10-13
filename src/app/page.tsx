'use client';
import React, { useState, useEffect } from 'react';

export default function MasinyusaneHome() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = 4;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides) % slides);

  return (
    <div className="min-h-screen bg-white">
   

      {/* Hero Video Section */}
      <section className="relative h-screen mt-16">
        <div className="relative h-full">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src="/videos/Home_Page_Hero_Video_3.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Empowering Through Education</h1>
                <p className="text-xl md:text-2xl drop-shadow-lg">Local Communities Implementing Data-Driven Literacy & Numeracy Programmes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold">Our <span className="font-light">Mission</span></h2>
            </div>
            <div>
              <p className="text-lg mb-4">Masinyusane creates opportunities for impoverished children and youth to get the best education possible. We invest in high-impact education projects that empower the local community to uplift itself.</p>
              <p className="text-lg">We are simultaneously creating a generation of leaders now while investing in the long-term future of South Africa's children.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Child Strip */}
      <section className="relative">
        <img src="/images/Website Strip - Child Red.png" alt="Smiling Girl" className="w-full h-auto" />
        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 text-white hidden md:block">
          <h1 className="text-8xl font-extrabold mb-2">2x</h1>
          <p className="text-2xl font-light">Children on the program</p>
          <p className="text-2xl font-semibold">learn to read twice as fast.</p>
        </div>
      </section>

      {/* Child Info Strip */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Early <span className="font-light">Childhood Education</span></h2>
              <h6 className="text-xl text-gray-700 mb-6">Providing children with the education they deserve.</h6>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.youtube.com/watch?v=5j2d6nlFVe8&t=3s" target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition">Video</a>
                <a href="/data" className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-md hover:bg-red-50 transition">Data Portal</a>
              </div>
            </div>
            <div>
              <p className="text-lg mb-4">We implement data-driven children's literacy programmes, with a major focus on literacy and numeracy. We invest in Teaching at the Right Level programmes, providing children with customised, individual lessons designed to provide them with the educational foundation that they deserve.</p>
              <p className="text-lg">Our focus is on children aged 2 - 13, with the most attention going to the youngest children.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:grid grid-cols-4 gap-8 mt-16">
            <div className="pl-6">
              <h2 className="text-5xl font-bold text-red-600 mb-2">2x</h2>
              <p className="text-gray-700">Children on the program learn to read twice as fast as children that are not.</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-5xl font-bold text-red-600 mb-2">400%</h2>
              <p className="text-gray-700">Preschool children drastically outperform control groups on literacy basics tests.</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-5xl font-bold text-red-600 mb-2">43%</h2>
              <p className="text-gray-700">On average, our primary school age children outperform peers by 43% YoY.</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-5xl font-bold text-red-600 mb-2">18756</h2>
              <p className="text-gray-700">Children are participating in our literacy & reading projects in 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* Youth Strip */}
      <section className="relative">
        <img src="/images/Website Strip Community jobs 2 (sml).png" alt="Community Jobs" className="w-full h-auto" />
        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 text-white hidden md:block">
          <h1 className="text-8xl font-extrabold mb-2">316</h1>
          <p className="text-2xl font-light">We have created</p>
          <p className="text-2xl font-semibold">316 Community Jobs.</p>
        </div>
      </section>

      {/* Youth Info Strip */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Community <span className="font-light">Jobs</span></h2>
              <h6 className="text-xl text-gray-700 mb-2">Empowering a community to uplift itself.</h6>
              <h6 className="text-xl text-gray-700 mb-6">Local jobs in local schools.</h6>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.youtube.com/watch?v=5j2d6nlFVe8&t=3s" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition">Video</a>
                <a href="/data" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-md hover:bg-blue-50 transition">Data Portal</a>
              </div>
            </div>
            <div>
              <p className="text-lg mb-4">We create jobs for previously unemployed community youth and put them to work in libraries and literacy centers that we build in impoverished early childhood development centres, preschools, and primary schools.</p>
              <p className="text-lg">Using proven methodologies, our literacy coaches provide children with one-on-one literacy coaching for the first 5-7 years of their schooling life. All day. Every day.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:grid grid-cols-4 gap-8 mt-16">
            <div className="pl-6">
              <h2 className="text-5xl font-bold text-blue-600 mb-2">92%</h2>
              <p className="text-gray-700">of our jobs go to women.</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-5xl font-bold text-blue-600 mb-2">1318</h2>
              <p className="text-gray-700">Previously unemployed youth have received jobs</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-5xl font-bold text-blue-600 mb-2">43%</h2>
              <p className="text-gray-700">Highest youth unemployment rate in the world.</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-5xl font-bold text-blue-600 mb-2">75%</h2>
              <p className="text-gray-700">of South Africans are unemployed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scholarship Strip */}
      <section className="relative">
        <img src="/images/Website Strip - TL.png" alt="Top Learner" className="w-full h-auto" />
        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 text-white hidden md:block">
          <h1 className="text-8xl font-extrabold mb-2">454</h1>
          <p className="text-2xl font-light">We have empowered</p>
          <p className="text-2xl font-semibold">454 University Graduates</p>
        </div>
      </section>

      {/* Scholarship Info Strip */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Scholarship <span className="font-light">Fund</span></h2>
              <h6 className="text-xl text-gray-700 mb-6">Investing in a generation of future leaders.</h6>
              <a href="https://www.youtube.com/watch?v=QUfevyYW1H8" target="_blank" rel="noopener noreferrer" className="border-2 border-yellow-500 text-yellow-600 px-8 py-3 rounded-md hover:bg-yellow-50 transition inline-block">Video</a>
            </div>
            <div>
              <p className="text-lg mb-4">What would happen if you flooded South Africa's most impoverished communities with university graduates?</p>
              <p className="text-lg mb-4">We are going to find out.</p>
              <p className="text-lg">These young leaders are becoming empowered to uplift their own families, solve their own community's problems, and to serve as role models to other youth.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:grid grid-cols-4 gap-8 mt-16">
            <div className="pl-6">
              <h2 className="text-5xl font-bold text-yellow-600 mb-2">10,000+</h2>
              <p className="text-gray-700">High school learners assisted</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-5xl font-bold text-yellow-600 mb-2">88%</h2>
              <p className="text-gray-700">Pass-rate</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-5xl font-bold text-yellow-600 mb-2">259</h2>
              <p className="text-gray-700">Employed graduates</p>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-5xl font-bold text-yellow-600 mb-2">1,000</h2>
              <p className="text-gray-700">University graduates by 2028</p>
            </div>
          </div>
        </div>
      </section>

      {/* Annual Report Section */}
      <section className="relative h-[550px] bg-cover bg-center" style={{backgroundImage: "url('/images/AR 23 Cover Page.png')", backgroundSize: '85%', backgroundRepeat: 'no-repeat'}}>
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Impact This Year</h1>
          <p className="text-xl mb-6">Journey through our achievements and milestones.</p>
          <a href="/reports/2024 Masi Annual Report ($).pdf" target="_blank" rel="noopener noreferrer" className="border-2 border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition text-lg">Read the Annual Report</a>
        </div>
      </section>

      {/* Meet Graduates Carousel */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4">
              <h2 className="text-3xl md:text-4xl font-bold">Hear <span className="font-light">From Our Graduates</span></h2>
            </div>
            <div className="md:col-span-8 relative">
              <div className="relative overflow-hidden rounded-lg">
                <div className="flex transition-transform duration-500" style={{transform: `translateX(-${activeSlide * 100}%)`}}>
                  <img src="/images/grads/grad-carousel1.png" alt="Graduate 1" className="w-full flex-shrink-0" />
                  <img src="/images/grads/grad-carousel2.png" alt="Graduate 2" className="w-full flex-shrink-0" />
                  <img src="/images/grads/grad-carousel3.png" alt="Graduate 3" className="w-full flex-shrink-0" />
                  <img src="/images/grads/grad-carousel4.png" alt="Graduate 4" className="w-full flex-shrink-0" />
                </div>
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition">‹</button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition">›</button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <button key={i} onClick={() => setActiveSlide(i)} className={`w-3 h-3 rounded-full transition ${activeSlide === i ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Portal Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Data-Driven <span className="font-light">Results</span></h2>
              <p className="text-lg mb-8">We measure dozens of metrics for each child. By leveraging real-time data, we can tailor interventions to meet the specific needs of each child, maximizing the impact of our programs.</p>
              <a href="/data" className="relative inline-block px-8 py-3 border-2 border-white text-white font-semibold overflow-hidden group">
                <span className="relative z-10">Enter Data Portal</span>
              </a>
            </div>
            <div className="hidden md:block">
              <img src="/images/polar_chart_transparent_white_labels_with_padding.png" alt="Data Chart" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl font-bold mb-6">Our <span className="font-light">Differentiated Approach</span></h2>
              <p className="text-lg text-gray-700">We leverage data, scale our programs, stay transparent, and empower communities for lasting impact.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h5 className="font-bold text-lg mb-2">Data-Driven</h5>
                <p className="text-sm text-gray-600">We collect and analyze data to tailor our programs for maximum effectiveness and better outcomes.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h5 className="font-bold text-lg mb-2">Scalable Solutions</h5>
                <p className="text-sm text-gray-600">We design our interventions to be easily scalable, maximizing the impact of every contribution.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h5 className="font-bold text-lg mb-2">Complete Transparency</h5>
                <p className="text-sm text-gray-600">We ensure transparency in our finances and operations, providing accountability to all stakeholders.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h5 className="font-bold text-lg mb-2">Community Focused</h5>
                <p className="text-sm text-gray-600">We empower local communities, creating opportunities and supporting self-driven growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12">Trusted <span className="font-light">By</span></h2>
          <div className="relative">
            <div className="flex animate-scroll space-x-12">
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex space-x-12 flex-shrink-0">
                  <img src="/images/logos/logo-dgmt.jpg" alt="DGMT" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <img src="/images/logos/logo-MIT.png" alt="MIT" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <img src="/images/logos/logo-DoE.png" alt="DoE" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <img src="/images/logos/logo-tlt.png" alt="TLT" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <img src="/images/logos/logo-vw.png" alt="VW" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <img src="/images/logos/logo-DoE-national.jpeg" alt="National DoE" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <img src="/images/logos/logo-dd.png" alt="DD" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                  <img src="/images/logos/logo-yebo.png" alt="Yebo" className="h-16 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div>
              <h6 className="text-white font-semibold mb-4">Masinyusane</h6>
              <div className="mb-4">
                <p className="font-semibold text-white text-sm">South Africa</p>
                <p className="text-sm">72 Russell Road, Central, Gqeberha 6001</p>
                <p className="text-sm">NPO: 074-244</p>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">United States</p>
                <p className="text-sm">149 Massachusetts Avenue, Boston, MA</p>
                <p className="text-sm">501c3: 27-3024837</p>
                <p className="text-sm mt-2">Email: info@masinyusane.org</p>
              </div>
            </div>
            <div>
              <h6 className="text-white mb-4 text-sm font-semibold">Resources</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/data" className="hover:text-yellow-500 transition">Data Portal</a></li>
                <li><a href="/impact" className="hover:text-yellow-500 transition">Reports</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white mb-4 text-sm font-semibold">Connect</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.facebook.com/masinyusane/" className="hover:text-yellow-500 transition">Facebook</a></li>
                <li><a href="https://www.tiktok.com/@masinyusane1" className="hover:text-yellow-500 transition">Tik Tok</a></li>
                <li><a href="https://www.instagram.com/masinyusane/" className="hover:text-yellow-500 transition">Instagram</a></li>
              </ul>
              <img src="/images/Guidestar Platinum Seal.png" alt="Guidestar" className="h-24 mt-4" />
            </div>
          </div>
          <hr className="my-8 border-gray-700" />
          <div className="text-center text-sm">
            <p>&copy; 2024 Masinyusane. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}