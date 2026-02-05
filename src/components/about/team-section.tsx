import StaffPhoto from '@/components/about/staff-photo';

const teamMembers = [
  {
    id: 1,
    firstName: 'Thembeka',
    lastName: 'Nobomvu',
    role: 'Programme Manager',
    image: 'images/staff/thembeka-mask.webp'
  },
  {
    id: 2,
    firstName: 'Buyiswa',
    lastName: 'Xaba',
    role: 'Programme Manager',
    image: 'images/staff/buyi-mask.webp'
  },
  {
    id: 3,
    firstName: 'Zola',
    lastName: 'Mbusi',
    role: 'Chief Operating Officer',
    image: 'images/staff/zola-mask.webp'
  },
  {
    id: 4,
    firstName: 'Chombe',
    lastName: 'Ncandana',
    role: 'ECD Team Leader',
    image: 'images/staff/chombe-mask.webp'
  },
  {
    id: 5,
    firstName: 'Nwabisa',
    lastName: 'Ngceshe',
    role: 'Finance Team',
    image: 'images/staff/nwabisa-mask.webp'
  },
  {
    id: 6,
    firstName: 'Tumelo',
    lastName: 'Lungile',
    role: 'Data Team Lead',
    image: 'images/staff/tumelo-mask.webp'
  },
  {
    id: 7,
    firstName: 'Sinesipho',
    lastName: 'Ntunuka',
    role: 'Bursary Project Manager',
    image: 'images/staff/sine-mask.webp'
  },
  {
    id: 8,
    firstName: 'Ziyanda',
    lastName: 'Fayindlala',
    role: 'ECD Project Manager',
    image: 'images/staff/ziyanda-mask.webp'
  }
];

export default function TeamSection() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Centered Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
            Our Team
          </h2>
          <p className="text-xl md:text-2xl font-medium bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
            Meet the team behind Masinyusane
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center">
              {/* Staff Photo */}
              <StaffPhoto
                imageSrc={member.image}
                alt={`${member.firstName} ${member.lastName}`}
                align="center"
                className="mb-2"
              />

              {/* Name with gradient */}
              <h3 className="text-xl font-bold text-center mb-1">
                <span className="bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                  {member.firstName}
                </span>{' '}
                <span className="text-gray-900">{member.lastName}</span>
              </h3>

              {/* Role */}
              <p className="text-sm text-gray-600 text-center">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
