'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

export default function Footer() {
    return (
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
                <li><a href="/" className="hover:text-yellow-500 transition">Home</a></li>
                <li><a href="/about" className="hover:text-yellow-500 transition">About Us</a></li>
                <li><a href="/where-we-work" className="hover:text-yellow-500 transition">Where We Work</a></li>
                <li><a href="/apply" className="hover:text-yellow-500 transition">Apply Here</a></li>
                <li><a href="/staff-portal" className="hover:text-yellow-500 transition">Staff Portal</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white mb-4 text-sm font-semibold">Programmes</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/early-childhood-education" className="hover:text-yellow-500 transition">Early Childhood Education</a></li>
                <li><a href="/community-jobs" className="hover:text-yellow-500 transition">Community Jobs</a></li>
                <li><a href="/scholarship-fund" className="hover:text-yellow-500 transition">Scholarship Fund</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white mb-4 text-sm font-semibold">Resources</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/data" className="hover:text-yellow-500 transition">Data Portal</a></li>
                <li><a href="/reports" className="hover:text-yellow-500 transition">Reports</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white mb-4 text-sm font-semibold">Connect</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.facebook.com/masinyusane/" className="hover:text-yellow-500 transition">Facebook</a></li>
                <li><a href="https://www.tiktok.com/@masinyusane1" className="hover:text-yellow-500 transition">Tik Tok</a></li>
                <li><a href="https://www.instagram.com/masinyusane/" className="hover:text-yellow-500 transition">Instagram</a></li>
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