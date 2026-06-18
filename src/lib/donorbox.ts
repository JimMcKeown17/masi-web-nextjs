export type Campaign = 'masi-literacy' | 'masi-jobs' | 'masi-scholars' | 'masi-donations';

const BASE = 'https://donorbox.org';

/**
 * Build a DonorBox campaign URL with the donation amount and interval pre-filled.
 * DonorBox supports forcing monthly via `default_interval=m`; it has NO param to
 * force one-time, so one-time gifts simply omit it and inherit the campaign's
 * one-time default (see the campaign-config note in the design spec).
 */
export function donorboxUrl(
  campaign: Campaign,
  opts: { amount?: number; monthly?: boolean } = {},
): string {
  const params = new URLSearchParams();
  if (opts.amount != null) params.set('amount', String(opts.amount));
  if (opts.monthly) params.set('default_interval', 'm');
  const qs = params.toString();
  return `${BASE}/${campaign}${qs ? `?${qs}` : ''}`;
}
