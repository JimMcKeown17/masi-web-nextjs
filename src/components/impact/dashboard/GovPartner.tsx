export function GovPartner() {
  return (
    <section className="border-y border-black/5 bg-[#FAF7F2]">
      <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-7 px-6 py-14 md:flex-row md:items-center md:px-12 lg:px-20">
        <div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-full border-2 border-[#1D4ED8]/30 bg-white text-[13px] font-extrabold tracking-wide text-[#1D4ED8]">
          EC DoE
        </div>
        <div>
          <h2 className="font-serif text-[22px] leading-snug text-[#14181D] md:text-[26px]">
            Feature partner to the Eastern Cape Department of Education
          </h2>
          <p className="mt-2 max-w-[640px] text-[14.5px] leading-relaxed text-gray-600">
            These results led the provincial government to make Masinyusane its featured literacy partner, with a signed
            MOU and standing weekly working sessions with senior officials to take what works to every district.
          </p>
          <div className="mt-3 flex flex-wrap gap-5 text-[12.5px] font-semibold text-gray-500">
            {["MOU signed", "Weekly sessions with provincial leadership", "Co-designing province-wide early-grade uplift"].map(
              (milestone) => (
                <span key={milestone} className="flex items-center gap-1.5">
                  <span className="text-[#14181D]">&#10003;</span>
                  {milestone}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
