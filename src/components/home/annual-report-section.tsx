'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';


export default function AnnualReportSection() {
    return (
        <section className="relative h-[550px] overflow-hidden">
        <Image 
          src={getImageUrl('images/AR 23 Cover Page.png')}
          alt="Annual Report 2023"
          fill
          className="object-cover"
          priority={false}
        />
        {/* <section className="relative h-[550px] bg-cover bg-center" style={{backgroundImage: `url(${getImageUrl('images/AR 23 Cover Page.png')})`, backgroundSize: '85%', backgroundRepeat: 'no-repeat'}}> */}
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center px-4 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">Our Impact This Year</h1>
          <p className="text-xl mb-6">Journey through our achievements and milestones.</p>
          <a href="/reports/2024 Masi Annual Report ($).pdf" target="_blank" rel="noopener noreferrer" className="border-2 border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition text-lg">Read the Annual Report</a>
        </div>
      </section>
        
    )
}