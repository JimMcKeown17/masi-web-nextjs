import { FadeUp } from '@/components/animations/FadeAnimations';

// Video IDs are placeholders — swap for Masi-specific content when available
const programmeVideos = [
  {
    videoId: 'tj_W0jlFiPQ',
    title: 'Potential',
    description: 'Children have unlimited potential. At Masi, we make sure they all unlock it.',
  },
  {
    videoId: '5j2d6nlFVe8',
    title: 'Empowering Communities',
    description: 'We create local jobs for women to uplift their own communities.',
  },
  {
    videoId: 'NFphbdyWW6M',
    title: 'Sume Centre',
    description: 'Our new Masi preschool, a fun, innovative, data-driven play-based preschool.',
  },
  {
    videoId: 'FQUOI-kfbnI',
    title: 'Harnessing the Wind',
    description: 'Our rural area literacy project bringing reading to remote communities.',
  },
  {
    videoId: '5IGCPFL-jEI',
    title: "Children's Education & Youth Jobs",
    description: 'A feature film on Masinyusane\'s dual impact model.',
  },
];

const zaziIzandiVideos = [
  {
    videoId: 'GsLPCxvZaEs',
    title: 'Prof Brahm Fleisch on the Data',
    description: 'Leading education researcher unpacks what the numbers show about early literacy.',
  },
  {
    videoId: '-9uOn3q2Ml0',
    title: 'The Full Feature Film',
    description: 'An in-depth look at the programme and the children it reaches.',
  },
  {
    videoId: 'dmqxmZIELXo',
    title: 'Inside Zazi iZandi Training',
    description: 'Preparing youth to transform classrooms across the Eastern Cape.',
  },
  {
    videoId: 'EnEIL25_7Vs',
    title: 'Zama Zulu on eNCA',
    description: "Masinyusane's Executive Director discusses youth employment and early literacy.",
  },
];

const livesChangedVideos = [
  {
    videoId: 'FN0Lb-63oRI',
    title: "Alizwa's Journey",
    description: 'Follow Alizwa as she shares how Masinyusane changed the course of her life.',
  },
  {
    videoId: '7tOS9Xl094M',
    title: "Ethel's Story",
    description: "Ethel's personal account of growth and opportunity through Masinyusane.",
  },
  {
    videoId: '2IizoZbQBJU',
    title: "Xabisa's Dream",
    description: 'Xabisa shares the dream that Masinyusane helped make possible.',
  },
  {
    videoId: 'eYohUCB7N5E',
    title: "Silindokuhle's Bursary",
    description: 'How a Masinyusane bursary opened the door to university for Silindokuhle.',
  },
];

const classroomVideos = [
  {
    videoId: 'QUfevyYW1H8',
    title: 'Girls Scholarship Fund',
    description: 'Supporting young women through university with bursaries and mentorship.',
  },
  {
    videoId: '5gf_Mxi_dfg',
    title: 'Masi House 2025',
    description: 'Our Masi House of Excellence, a home for our top learners to thrive.',
  },
  {
    videoId: 'VX2c5tC4pvs',
    title: 'Masi House 2018',
    description: 'One of our original Masi Houses of Excellence. Where it all began.',
  },
];

function CategoryHeader({ label, intro }: { label: string; intro?: string }) {
  return (
    <div className={intro ? 'mb-6' : 'mb-8'}>
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-[#E72D4D]" />
        <h3 className="text-sm tracking-[0.25em] uppercase text-white/70 font-medium">{label}</h3>
      </div>
      {intro && <p className="text-white/55 text-sm max-w-2xl mt-4 leading-relaxed">{intro}</p>}
    </div>
  );
}

function VideoCard({ videoId, title, description }: { videoId: string; title: string; description: string }) {
  return (
    <div className="bg-[#171C24] rounded-lg overflow-hidden ring-1 ring-white/5 hover:ring-[#E72D4D]/40 transition-all duration-300">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <div className="p-4">
        <p className="font-serif text-white text-base leading-snug">{title}</p>
        <p className="text-white/55 text-xs mt-1.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function VideosSection() {
  return (
    <section className="bg-[#0E1116] py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <FadeUp className="max-w-2xl mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#E72D4D]" />
            <span className="text-sm tracking-[0.25em] uppercase text-white/60">Video Library</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-white">
            Watch the{' '}
            <span className="italic font-light text-[#E72D4D]">work.</span>
          </h2>
        </FadeUp>

        {/* Children & Youth */}
        <FadeUp className="mb-16">
          <CategoryHeader label="Children & Youth" />
          <div className="flex gap-6 overflow-x-auto pb-4">
            {programmeVideos.map((v) => (
              <div key={v.videoId} className="w-[280px] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0">
                <VideoCard {...v} />
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Top Learners */}
        <FadeUp className="mb-16">
          <CategoryHeader
            label="Top Learners"
            intro="Inside the Masi Houses of Excellence and the scholarships that carry our brightest learners through university."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classroomVideos.map((v) => (
              <VideoCard key={v.videoId} {...v} />
            ))}
          </div>
        </FadeUp>

        {/* Zazi iZandi */}
        <FadeUp className="mb-16">
          <CategoryHeader label="Zazi iZandi" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {zaziIzandiVideos.map((v) => (
              <VideoCard key={v.videoId} {...v} />
            ))}
          </div>
        </FadeUp>

        {/* Real Lives, Real Impact */}
        <FadeUp>
          <CategoryHeader
            label="Real Lives, Real Impact"
            intro="Personal stories from the people whose lives have been transformed through Masinyusane's programmes."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {livesChangedVideos.map((v) => (
              <VideoCard key={v.videoId} {...v} />
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
