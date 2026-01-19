import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Women's Employment & Youth Job Programs in South Africa",
  description: "Creating employment opportunities for women and youth in South Africa. Our community jobs program empowers women through job training, placement, and economic development initiatives to fight poverty.",
  keywords: [
    "women employment South Africa",
    "women jobs Africa",
    "youth employment South Africa",
    "job training South Africa",
    "economic empowerment women Africa",
    "community employment programs",
    "women's job opportunities Africa",
    "poverty alleviation South Africa"
  ],
  openGraph: {
    title: "Women's Employment & Community Jobs | Masinyusane",
    description: "Empowering women and youth through employment opportunities, job training, and economic development in South African communities.",
    url: "https://www.masinyusane.org/programs/community-jobs"
  }
};

export default function CommunityJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
