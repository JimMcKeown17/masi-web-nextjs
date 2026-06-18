import type { Campaign } from '@/lib/donorbox';

export interface Gift {
  id: string;
  amount: number;        // 6.5, 15, 273, 185, 225
  monthly: boolean;      // false = one-time
  name: string;
  description: string;
  campaign: Campaign;
  badge?: string;        // e.g. "Most chosen"
  note?: string;         // small line next to the interval, e.g. "about R3,500"
}

export interface Programme {
  key: 'children' | 'youth' | 'graduates';
  index: '01' | '02' | '03';
  label: string;                                          // eyebrow
  headline: { lead: string; accent: string; tail?: string }; // accent = italic word(s)
  sub: string;
  accent: string;                                         // hex
  background: string;                                     // section bg hex
  layout: 'row' | 'feature' | 'feature-rev';
  image?: string;                                         // GCS path for feature photo (placeholder)
  gifts: Gift[];
}

/** Render a money figure: integers bare ("$15"), non-integers to cents ("$6.50"). */
export const formatAmount = (a: number): string =>
  Number.isInteger(a) ? `$${a}` : `$${a.toFixed(2)}`;

export const PROGRAMMES: Programme[] = [
  {
    key: 'children',
    index: '01',
    label: 'Children learning to read',
    headline: { lead: 'Teach a child to ', accent: 'read.' },
    sub: "From a child's very first letter-sounds to a whole classroom reading together.",
    accent: '#C81E3C',
    background: '#FFFFFF',
    layout: 'row',
    gifts: [
      {
        id: 'sounds', amount: 6.5, monthly: true, campaign: 'masi-literacy',
        name: "A child's sounds",
        description: 'Each month, another child masters their letter-sounds through Zazi iZandi, the foundation everything else builds on. Twelve children a year.',
      },
      {
        id: 'reader', amount: 15, monthly: true, campaign: 'masi-literacy', badge: 'Most chosen',
        name: 'Sponsor a young reader',
        description: 'One child in our intensive literacy programme: a trained local coach and a small group of twelve.',
      },
      {
        id: 'class', amount: 273, monthly: false, campaign: 'masi-literacy',
        name: 'A whole classroom',
        description: 'All 42 children in a class learn their sounds for a year, stretched further by government co-funding.',
      },
    ],
  },
  {
    key: 'youth',
    index: '02',
    label: 'Youth at work',
    headline: { lead: 'One job. ', accent: 'Twelve', tail: ' readers.' },
    sub: 'Our most efficient gift: one salary that does two jobs at once.',
    accent: '#1D4ED8',
    background: '#FAF7F2',
    layout: 'feature',
    image: 'images/Azaluve Mama & Aphathelwe Makabana.webp', // PLACEHOLDER: swap for a coach + learners photo
    gifts: [
      {
        id: 'job', amount: 185, monthly: true, campaign: 'masi-jobs', note: 'about R3,500',
        name: 'Fund a community job',
        description: 'Employ a local young person as a literacy coach. That single salary creates real employment and teaches a class of twelve children to read. The same rand, working twice.',
      },
    ],
  },
  {
    key: 'graduates',
    index: '03',
    label: 'All the way to university',
    headline: { lead: 'Carry a scholar to ', accent: 'graduation.' },
    sub: 'The long game: a top learner, supported every step from matric to a degree.',
    accent: '#B8860B',
    background: '#FFFFFF',
    layout: 'feature-rev',
    image: 'images/tl-photo-1.webp', // PLACEHOLDER: reuses a top-learners graduate photo
    gifts: [
      {
        id: 'scholar', amount: 225, monthly: true, campaign: 'masi-scholars',
        name: 'Sponsor a scholar',
        description: 'Fees, books, and mentoring that carry a top learner all the way through university and into a career that lifts a whole family.',
      },
    ],
  },
];
