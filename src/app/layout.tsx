import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { getUserProfile } from '@/lib/server/user';
import { UserProvider } from '@/components/providers/UserProvider';
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif for the "Ink & Signal" design system. See documentation/design-system.md
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.masinyusane.org'),
  title: {
    default: "Masinyusane | Education, Literacy & Women's Employment in South Africa",
    template: "%s | Masinyusane"
  },
  description: "Transforming lives through education in South Africa. We provide early childhood literacy programs, numeracy support, and women's employment opportunities to fight poverty and build stronger communities.",
  keywords: [
    "education in Africa",
    "literacy programs South Africa",
    "numeracy programs Africa",
    "early childhood education South Africa",
    "women employment South Africa",
    "women jobs Africa",
    "fight poverty Africa",
    "educational non-profit South Africa",
    "literacy intervention programs",
    "community development South Africa",
    "mentorship programs Africa",
    "youth employment South Africa",
    "educational NGO Africa"
  ],
  authors: [{ name: "Masinyusane" }],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://www.masinyusane.org",
    title: "Masinyusane | Empowering Through Education in South Africa",
    description: "Transforming lives through education in South Africa. Early childhood literacy, numeracy programs, and women's employment opportunities.",
    siteName: "Masinyusane",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Masinyusane - Education Programs in South Africa"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Masinyusane | Education & Women's Employment in South Africa",
    description: "Transforming lives through education. Early childhood literacy, numeracy, and women's employment opportunities in South Africa.",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://www.masinyusane.org"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userProfile = await getUserProfile();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        <ClerkProvider>
          <UserProvider user={userProfile}>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </UserProvider>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
