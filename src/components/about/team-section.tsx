'use client';
import StaffPhoto from '@/components/about/staff-photo';
import { FadeUp } from '@/components/animations/FadeAnimations';

const teamMembers = [
  { id: 4, firstName: 'Chombe', lastName: 'Ncandana', role: 'Programmes Manager', image: 'images/staff/chombe-mask.webp' },
  { id: 1, firstName: 'Noxolo', lastName: 'Mkutswana', role: 'Data & HR', image: 'images/staff/Noxolo-Mkutswana.webp' },
  { id: 2, firstName: 'Buyiswa', lastName: 'Xaba', role: 'ZZ Programme Manager', image: 'images/staff/buyi-mask.webp' },
  { id: 3, firstName: 'Zola', lastName: 'Mbusi', role: 'Chief Operating Officer', image: 'images/staff/zola-mask.webp' },
  { id: 5, firstName: 'Nwabisa', lastName: 'Ngceshe', role: 'Finance Team', image: 'images/staff/nwabisa-mask.webp' },
  { id: 6, firstName: 'Tumelo', lastName: 'Lungile', role: 'Data Team Lead', image: 'images/staff/tumelo-mask.webp' },
  { id: 7, firstName: 'Anelisa', lastName: 'Fikayo', role: 'Top Learners', image: 'images/staff/Anelisa-Fikayo.webp' },
  { id: 8, firstName: 'Ziyanda', lastName: 'Fayindlala', role: 'ECD Project Manager', image: 'images/staff/ziyanda-mask.webp' },
];

export default function TeamSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#C81E3C]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our team</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            The people behind <span className="italic font-light text-[#C81E3C]">the work.</span>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 max-w-7xl mx-auto">
          {teamMembers.map((member, i) => (
            <FadeUp key={member.id} delay={0.05 * (i % 4)} className="flex flex-col items-center">
              <StaffPhoto
                imageSrc={member.image}
                alt={`${member.firstName} ${member.lastName}`}
                align="center"
                className="mb-3"
              />
              <h3 className="text-lg font-semibold text-[#14181D] text-center">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-sm text-gray-500 text-center mt-0.5">{member.role}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
