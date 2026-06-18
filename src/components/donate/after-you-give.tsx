import { FadeUp } from '@/components/animations/FadeAnimations';

const STEPS = [
  { i: '01', t: 'You choose a gift', d: 'Pick a card, or your own amount. Secure checkout through DonorBox, monthly or one-time.' },
  { i: '02', t: 'We put it to work', d: 'Your gift goes straight into the programme you chose, where the cost figures come from.' },
  { i: '03', t: 'Reports reach you monthly', d: 'Programme progress in your inbox: results, photos, and stories from the work you fund.' },
];

export default function AfterYouGive() {
  return (
    <section className="bg-[#FAF7F2] py-16 md:py-20">
      <div className="container mx-auto px-4">
        <FadeUp>
          <h2 className="font-serif text-2xl font-medium text-[#14181D] md:text-3xl">What happens after you give</h2>
        </FadeUp>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <FadeUp key={s.i} delay={0.1 * i}>
              <div className="font-serif text-base italic text-[#E72D4D]">{s.i}</div>
              <h3 className="mt-2 font-semibold text-[#14181D]">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.d}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
