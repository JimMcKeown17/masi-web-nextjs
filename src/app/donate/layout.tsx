import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Donate to Masinyusane | Education in South Africa",
  description: "Choose what your gift builds: teach a child to read, fund a community job, or sponsor a university scholar. Every figure is an audited cost.",
  keywords: [
    "donate to education Africa",
    "support literacy South Africa",
    "sponsor a student South Africa",
    "education charity Africa",
    "nonprofit donation South Africa",
  ],
  openGraph: {
    title: "Donate | Masinyusane",
    description: "Teach a child to read, fund a community job, or sponsor a scholar. Every gift is an audited cost.",
    url: "https://www.masinyusane.org/donate",
  },
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
