import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Donate to Support Education in South Africa",
  description: "Support literacy programs, numeracy education, and women's employment opportunities in South Africa. Your donation transforms lives through education and fights poverty in underserved communities.",
  keywords: [
    "donate to education Africa",
    "support literacy South Africa",
    "education charity Africa",
    "donate to African education",
    "support women employment Africa",
    "nonprofit donation South Africa"
  ],
  openGraph: {
    title: "Donate | Masinyusane",
    description: "Transform lives through education in South Africa. Support literacy, numeracy, and women's employment programs.",
    url: "https://www.masinyusane.org/donate"
  }
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
