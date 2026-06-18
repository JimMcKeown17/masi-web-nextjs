import { donorboxUrl } from '@/lib/donorbox';
import { formatAmount, type Gift } from './gifts';

// The whole card is the click target: it opens the DonorBox checkout for this
// gift (amount + interval pre-filled) in a new tab.
export default function GiftCard({ gift, accent }: { gift: Gift; accent: string }) {
  const highlighted = Boolean(gift.badge);
  return (
    <a
      href={donorboxUrl(gift.campaign, { amount: gift.amount, monthly: gift.monthly })}
      target="_blank"
      rel="noopener"
      className="group relative flex flex-col rounded-2xl bg-white p-6 transition-shadow hover:shadow-lg"
      style={{ borderColor: highlighted ? accent : '#E7E3DB', borderWidth: highlighted ? 2 : 1, borderStyle: 'solid' }}
    >
      {gift.badge && (
        <span
          className="absolute -top-2.5 left-5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
          style={{ backgroundColor: accent }}
        >
          {gift.badge}
        </span>
      )}
      <div className="font-serif text-3xl font-semibold leading-none" style={{ color: highlighted ? accent : '#14181D' }}>
        {formatAmount(gift.amount)}
      </div>
      <div className="mt-1 text-xs text-gray-500">{gift.monthly ? 'per month' : 'one-time'}</div>
      <h3 className="mt-3 text-base font-semibold text-[#14181D]">{gift.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">{gift.description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5" style={{ color: accent }}>
        {gift.monthly ? 'Sponsor monthly' : `Give ${formatAmount(gift.amount)}`} <span aria-hidden>&rarr;</span>
      </span>
    </a>
  );
}
