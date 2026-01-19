import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Early Childhood Education & Literacy Programs in South Africa",
  description: "Our early childhood education program provides literacy and numeracy intervention for children in underserved South African communities. Building foundations for lifelong learning through mentorship and structured learning support.",
  keywords: [
    "early childhood education South Africa",
    "literacy programs for children Africa",
    "numeracy intervention South Africa",
    "early learning South Africa",
    "childhood literacy Africa",
    "educational intervention programs",
    "reading programs South Africa"
  ],
  openGraph: {
    title: "Early Childhood Education Programs | Masinyusane",
    description: "Building literacy and numeracy foundations for children in South African communities through structured mentorship and intervention programs.",
    url: "https://www.masinyusane.org/programs/early-childhood-education"
  }
};

export default function EarlyChildhoodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
