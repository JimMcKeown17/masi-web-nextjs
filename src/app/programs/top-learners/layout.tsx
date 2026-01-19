import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Top Learners Scholarship Program | Academic Excellence in South Africa",
  description: "Recognizing and supporting academic excellence in South Africa. Our top learners scholarship program provides educational support and opportunities for high-achieving students in underserved communities.",
  keywords: [
    "scholarship programs South Africa",
    "academic excellence Africa",
    "student scholarships South Africa",
    "education support Africa",
    "top students South Africa",
    "merit scholarships Africa"
  ],
  openGraph: {
    title: "Top Learners Scholarship Program | Masinyusane",
    description: "Supporting academic excellence through scholarships and educational opportunities for top students in South African communities.",
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
