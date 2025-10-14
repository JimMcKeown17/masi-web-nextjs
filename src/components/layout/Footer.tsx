'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="relative bg-gray-900 text-gray-300 py-12">
        {/* Subtle gradient border at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-rose-600" />
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div>
              <h6 className="text-white font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-rose-400 bg-clip-text text-transparent">Masinyusane</span>
              </h6>
              <div className="mb-4">
                <p className="font-semibold text-white text-sm">South Africa</p>
                <p className="text-sm">72 Russell Road, Central, Gqeberha 6001</p>
                <p className="text-sm">NPO: 074-244</p>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-white text-sm">United States</p>
                <p className="text-sm">149 Massachusetts Avenue, Boston, MA</p>
                <p className="text-sm">50163: 27-3024837</p>
              </div>
              <div>
                <p className="text-sm">Email: info@masinyusane.org</p>
              </div>
            </div>
            <div>
              <h6 className="text-white mb-4 text-sm font-semibold">Quick Links</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
                <li><a href="/about" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="/where-we-work" className="hover:text-blue-400 transition-colors">Where We Work</a></li>
                <li><a href="/apply" className="hover:text-blue-400 transition-colors">Apply Here</a></li>
                <li><a href="/staff-portal" className="hover:text-blue-400 transition-colors">Staff Portal</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white mb-4 text-sm font-semibold">Programmes</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/early-childhood-education" className="hover:text-blue-400 transition-colors">Early Childhood Education</a></li>
                <li><a href="/community-jobs" className="hover:text-blue-400 transition-colors">Community Jobs</a></li>
                <li><a href="/scholarship-fund" className="hover:text-blue-400 transition-colors">Scholarship Fund</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white mb-4 text-sm font-semibold">Resources</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/data" className="hover:text-blue-400 transition-colors">Data Portal</a></li>
                <li><a href="/reports" className="hover:text-blue-400 transition-colors">Reports</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white mb-4 text-sm font-semibold">Connect</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.facebook.com/masinyusane/" className="hover:text-blue-400 transition-colors">Facebook</a></li>
                <li><a href="https://www.tiktok.com/@masinyusane1" className="hover:text-blue-400 transition-colors">Tik Tok</a></li>
                <li><a href="https://www.instagram.com/masinyusane/" className="hover:text-blue-400 transition-colors">Instagram</a></li>
              </ul>
              <Image 
                src={getImageUrl('images/Guidestar Platinum Seal.png')}
                alt="Guidestar"
                width={96}
                height={96}
                className="h-24 mt-4"
              />
              {/* <img src="/images/Guidestar Platinum Seal.png" alt="Guidestar" className="h-24 mt-4" /> */}
            </div>
          </div>
          <hr className="my-8 border-gray-700" />
          <div className="text-center text-sm">
            <p>&copy; 2025 Masinyusane. All rights reserved.</p>
          </div>
        </div>
      </footer>
        
    )
}