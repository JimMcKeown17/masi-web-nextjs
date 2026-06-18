import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import GiftButton from './gift-button';
import { formatAmount, type Gift } from './gifts';

export default function FeatureGift({
  gift, accent, image, reversed = false,
}: { gift: Gift; accent: string; image: string; reversed?: boolean }) {
  const text = (
    <div className="flex flex-col justify-center p-7 md:p-9">
      <div className="font-serif text-4xl font-semibold leading-none" style={{ color: accent }}>
        {formatAmount(gift.amount)}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {gift.monthly ? 'per month' : 'one-time'}{gift.note ? ` · ${gift.note}` : ''}
      </div>
      <h3 className="mt-3 text-xl font-semibold text-[#14181D]">{gift.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-[15px]">{gift.description}</p>
      <GiftButton campaign={gift.campaign} amount={gift.amount} monthly={gift.monthly} accent={accent} className="mt-4">
        Sponsor monthly <span aria-hidden>&rarr;</span>
      </GiftButton>
    </div>
  );
  const photo = (
    <div className="relative min-h-[220px]">
      <Image src={getImageUrl(image)} alt={gift.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
    </div>
  );
  return (
    <div className="grid max-w-5xl overflow-hidden rounded-2xl border border-[#E7E3DB] bg-white md:grid-cols-2">
      {reversed ? <>{photo}{text}</> : <>{text}{photo}</>}
    </div>
  );
}
