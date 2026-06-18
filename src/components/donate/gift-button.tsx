import { donorboxUrl, type Campaign } from '@/lib/donorbox';

interface GiftButtonProps {
  campaign: Campaign;
  amount?: number;
  monthly?: boolean;
  accent: string;            // hex, sets the link color
  children: React.ReactNode;
  className?: string;
}

// The `dbox-donation-button` class is what widget.js (loaded by <DonorboxScript />)
// hooks to open the checkout popup over the page.
export default function GiftButton({ campaign, amount, monthly, accent, children, className = '' }: GiftButtonProps) {
  return (
    <a
      href={donorboxUrl(campaign, { amount, monthly })}
      className={`dbox-donation-button inline-flex items-center gap-1.5 text-sm font-semibold ${className}`}
      style={{ color: accent }}
    >
      {children}
    </a>
  );
}
