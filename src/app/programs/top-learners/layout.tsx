import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Scholarship Fund",
  description: "Masinyusane's Scholarship Fund walks the brightest learners from Gqeberha's township schools through university to a career: full scholarships, mentoring, food, transport, and a home at our Houses of Excellence. 505 graduates and counting.",
  keywords: [
    "university scholarships South Africa",
    "township graduates",
    "student scholarships South Africa",
    "Houses of Excellence",
    "first generation graduates",
    "Masinyusane scholarship fund"
  ],
  openGraph: {
    title: "Scholarship Fund | Masinyusane",
    description: "Full university scholarships, mentoring, and a home for the brightest learners from Gqeberha's townships. 505 graduates and counting.",
    url: "https://www.masinyusane.org/programs/top-learners"
  }
};

export default function TopLearnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
