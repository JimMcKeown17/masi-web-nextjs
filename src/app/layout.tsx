import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
<<<<<<< HEAD
import { getUserProfile } from '@/lib/server/user'; 
import { UserProvider } from '@/components/providers/UserProvider';
=======
import { AuthProvider } from "@/contexts/AuthContext";
>>>>>>> e7a40b39502d8c2dedae911eb19b7c085f082d1d

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Masinyusane",
  description: "Empowering Through Education",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userProfile = await getUserProfile();
  return (
<<<<<<< HEAD

    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
            <ClerkProvider>
              <UserProvider user={userProfile}>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        </UserProvider>
        </ClerkProvider>
      </body>
    </html>
  
=======
    <ClerkProvider>
      <AuthProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
                
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
            
          </body>
        </html>
      </AuthProvider>
    </ClerkProvider>
>>>>>>> e7a40b39502d8c2dedae911eb19b7c085f082d1d
  );
}
