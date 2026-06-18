'use client';
import { useState } from 'react';
import { donorboxUrl } from '@/lib/donorbox';

export default function CustomAmountBand() {
  const [amount, setAmount] = useState('');

  // Custom amount is dynamic, so we open the hosted general campaign in a new tab
  // (query params are guaranteed there). The card grid uses the widget popup.
  const open = () => {
    const value = parseFloat(amount);
    const url = donorboxUrl('masi-donations', Number.isFinite(value) && value > 0 ? { amount: value } : {});
    window.open(url, '_blank', 'noopener');
  };

  return (
    <section className="bg-[#0E1116] py-14 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-2xl font-medium text-white md:text-3xl">Prefer to choose your own amount?</h2>
        <p className="mt-2 max-w-prose text-sm text-white/60">
          Give any amount, one-time or monthly. We will direct it where it is needed most.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-white/15 bg-[#0A0C10] px-3">
            <span className="text-white/50">$</span>
            <input
              type="number" min="3" inputMode="decimal" placeholder="Amount"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-40 bg-transparent px-2 py-3 text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
          <button
            onClick={open}
            className="rounded-lg bg-[#C81E3C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a91832]"
          >
            Continue <span aria-hidden>&rarr;</span>
          </button>
        </div>
        <p className="mt-5 text-[11px] tracking-[0.02em] text-white/45">
          Secure checkout by DonorBox &middot; Cancel a monthly gift anytime &middot; Section 18A tax receipt provided
        </p>
      </div>
    </section>
  );
}
