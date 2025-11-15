// app/layout-content.tsx
import { Navbar } from "@/components/layout/Navbar";
import { getUserProfile } from '@/lib/server/user'; 
import { UserProvider } from '@/components/providers/UserProvider';

export async function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getUserProfile();
  
  return (
    <UserProvider user={userProfile}>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </UserProvider>
  );
}