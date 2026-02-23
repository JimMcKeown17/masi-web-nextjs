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
    description: 'One of our original Masi Houses of Excllence. Where it all began.',
  },
];

function VideoCard({ videoId, title, description }: { videoId: string; title: string; description: string }) {
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden hover:bg-white/15 transition-colors duration-300">
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
        <p className="font-semibold text-white text-sm leading-snug">{title}</p>
        <p className="text-white/60 text-xs mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function VideosSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-800 via-blue-900 to-gray-950 py-20 overflow-hidden">
      {/* Dot texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(44,90,160,0.35),transparent)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Programme Videos */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-1 bg-yellow-400" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
              Children &amp; Youth Videos
            </h3>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {programmeVideos.map((v) => (
              <div key={v.videoId} className="w-[280px] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0">
                <VideoCard {...v} />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs uppercase tracking-widest font-medium">
            In the Classroom
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Classroom Videos */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-1 bg-yellow-400" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
              Top Learner Videos
            </h3>
          </div>
          <p className="text-white/60 text-sm max-w-2xl mb-8">
            Every game our Education Assistants run is designed to make daily
            letter-sound practice something children genuinely look forward to.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classroomVideos.map((v) => (
              <VideoCard key={v.videoId} {...v} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs uppercase tracking-widest font-medium">
            Programme
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Zazi iZandi Videos */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-1 bg-yellow-400" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
              Zazi iZandi Videos
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {zaziIzandiVideos.map((v) => (
              <VideoCard key={v.videoId} {...v} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs uppercase tracking-widest font-medium">
            Stories
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Lives Changed Videos */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-1 bg-yellow-400" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
              Real Lives, Real Impact
            </h3>
          </div>
          <p className="text-white/60 text-sm max-w-2xl mb-8">
            Personal stories from the people whose lives have been transformed
            through Masinyusane&apos;s programmes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {livesChangedVideos.map((v) => (
              <VideoCard key={v.videoId} {...v} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
