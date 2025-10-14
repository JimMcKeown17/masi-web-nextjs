import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

const teamMembers = [
  {
    id: 1,
    name: 'Thembeka Nobomvu',
    role: 'Programme Manager',
    image: 'images/staff/Thembeka-Nobomvu.jpg'
  },
  {
    id: 2,
    name: 'Buyiswa Xaba',
    role: 'Programme Manager',
    image: 'images/staff/Buyi-Xaba.jpg'
  },
  {
    id: 3,
    name: 'Zola Mbusi',
    role: 'Chief Operating Officer',
    image: 'images/staff/Zola-Mbusi.jpg'
  },
  {
    id: 4,
    name: 'Chombe Ncandana',
    role: 'ECD Team Leader',
    image: 'images/staff/Chombe-Ncandana.jpg'
  },
  {
    id: 5,
    name: 'Nwabisa Ngceshe',
    role: 'Finance Team',
    image: 'images/staff/Nwabisa.jpg'
  },
  {
    id: 6,
    name: 'Tumelo Lungile',
    role: 'Data Team Lead',
    image: 'images/staff/Tumelo.jpg'
  },
  {
    id: 7,
    name: 'Sinesipho Ntunuka',
    role: 'Bursary Project Manager',
    image: 'images/staff/Sinesipho-Ntunuka.jpg'
  },
  {
    id: 8,
    name: 'Ziyanda Fayindlala',
    role: 'ECD Project Manager',
    image: 'images/staff/Ziyanda-Fayindlala.jpg'
  }
];

export default function TeamSection() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 flex flex-col justify-center">
            <div className="inline-block mb-2">
              <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                Meet The Team
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Our <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Team</span>
            </h2>
          </div>
          <div className="lg:col-span-9">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={getImageUrl(member.image)}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-center">
                      <h5 className="font-bold text-sm mb-0.5">{member.name}</h5>
                      <p className="text-xs opacity-90">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

