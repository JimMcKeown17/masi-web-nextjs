import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';

export default function ContentSectionsV2() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-blue-50/30 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Section 1: Early Childhood Development - Offset Grid */}
          <div className="relative">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-[16/11]">
                    <Image
                      src={getImageUrl('/images/Literacy Session - Data Driven.png')}
                      alt="Early Childhood Development"
                      fill
                      className="object-cover"
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent" />
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-blue-200 to-rose-200 rounded-full blur-3xl opacity-30 -z-10" />
              </div>
              
              <div className="lg:col-span-5 space-y-6 lg:pl-8">
                <div className="inline-block">
                  <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-4 py-2 rounded-full">
                    Foundation
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                    Early Childhood Development
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-rose-600 rounded-full" />
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  We specialize in teaching children aged 2-9 how to read, write, and comprehend. The ability to read is the gateway to learning, forming the bedrock of a child's entire education. We are committed to ensuring that this foundation is strong, giving every child the tools they need to thrive academically and beyond.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Teaching at the Right Level - Split with Overlap */}
          <div className="relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 lg:pr-12 order-2 lg:order-1">
                <div className="inline-block">
                  <span className="text-sm font-semibold text-rose-600 tracking-wider uppercase bg-rose-50 px-4 py-2 rounded-full">
                    Personalized
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">
                    Teaching at the Right Level
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-rose-600 to-blue-600 rounded-full" />
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  We customize literacy sessions to the level the child is at, ensuring we maximize their learning and confidence. We track a dozen metrics for each child (see spider chart) and teach skills that build upon one another. Unlike a classroom teacher, driven by the need to get through a curriculum, we will stay with a child until they have achieved mastery for each skill.
                </p>
              </div>
              
              <div className="relative order-1 lg:order-2">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-[16/11]">
                    <Image
                      src={getImageUrl('/images/Child with Score Spider Chart.png')}
                      alt="Teaching at the Right Level"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                {/* Decorative corner accent */}
                <div className="absolute -top-8 -left-8 w-32 h-32 border-4 border-rose-200 rounded-3xl -z-10" />
                <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-gradient-to-br from-rose-200 to-blue-200 rounded-full blur-3xl opacity-30 -z-10" />
              </div>
            </div>
          </div>

          {/* Section 3: Scaling With Government - Full Width Feature */}
          <div className="relative bg-gradient-to-br from-blue-50 via-white to-rose-50 rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={getImageUrl('/images/Teacher Assistant with Child 2.png')}
                      alt="Scaling With Government"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <div className="inline-block">
                  <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-white px-4 py-2 rounded-full shadow-sm">
                    Scale
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                    Scaling With Government
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-rose-600 rounded-full" />
                <p className="text-lg text-gray-700 leading-relaxed">
                  To achieve maximum impact, one must partner with government. To that end, we design versions of our programs that can be implemented by government, NGOs, or schools. For example, we have had tremendous success partnering with the Department of Education to have their Teacher Assistants implement our letter learning initiative.
                </p>
              </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-3xl opacity-20 -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-rose-200 to-transparent rounded-full blur-3xl opacity-20 -z-10" />
          </div>

          {/* Section 4: Numeracy - Split with Feature Cards */}
          <div className="relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-[16/11]">
                    <Image
                      src={getImageUrl('/images/Child Numeracy.jpg')}
                      alt="Numeracy Education"
                      fill
                      className="object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-blue-200 to-rose-200 rounded-full blur-3xl opacity-30 -z-10" />
              </div>
              
              <div className="space-y-6 lg:pl-12">
                <div className="inline-block">
                  <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-4 py-2 rounded-full">
                    Mathematics
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                    Numeracy Fundamentals
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-rose-600 rounded-full" />
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  We do numeracy with children aged 3-6, teaching them the fundamentals of mathematics. Building strong numerical foundations early ensures children develop confidence with numbers, problem-solving skills, and logical thinking that will serve them throughout their educational journey.
                </p>
                
                {/* Age range cards */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">3-6</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">Age Range</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Core</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">Fundamentals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Thousands of Stories - Immersive Layout */}
          <div className="relative">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-6 order-2 lg:order-1 lg:pr-12">
                <div className="inline-block">
                  <span className="text-sm font-semibold text-rose-600 tracking-wider uppercase bg-rose-50 px-4 py-2 rounded-full">
                    Imagination
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">
                    Thousands of Stories
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-rose-600 to-blue-600 rounded-full" />
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  In addition to teaching children how to read, we strive to ensure every child hears 1,000 stories before the age of seven. Children who regularly hear stories develop stronger memories, expand their vocabularies, become more skilled readers, and nurture their imaginations, all while enhancing their critical thinking and problem-solving abilities, setting the stage for lifelong learning success.
                </p>
                
                {/* Story impact metrics */}
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
                    <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">1,000</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">Stories Goal</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
                    <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">Age 7</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">Target Milestone</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-7 relative order-1 lg:order-2">
                <div className="relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <div className="relative aspect-[16/11]">
                      <Image
                        src={getImageUrl('/images/Sandwater Primary - Literacy Session 2.jpg')}
                        alt="Thousands of Stories"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tl from-rose-900/20 to-transparent" />
                    </div>
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 hidden md:block">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">∞</p>
                      <p className="text-xs text-gray-600 font-semibold mt-2 text-center">Endless<br/>Learning</p>
                    </div>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-gradient-to-br from-rose-200 to-blue-200 rounded-full blur-3xl opacity-30 -z-10" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

