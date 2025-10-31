"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { getToken, isSignedIn, userId } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      console.log("🔍 loadData called, isSignedIn:", isSignedIn);
      
      if (!isSignedIn) {
        console.log("🔍 User not signed in, returning");
        return;
      }
      
      try {
        const token = await getToken();

        console.log("🔍 Token obtained:", token ? `${token.substring(0, 20)}...` : "null");
        
        const res = await fetch("https://www.masinyusane.org/api/me/", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log("🔍 Response status:", res.status);
        console.log("🔍 Response ok:", res.ok);
        console.log("🔍 Response headers:", Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) {
          const errorText = await res.text();
          console.log("🔍 Error response:", errorText);
          return;
        }
        
        const data = await res.json();
        console.log("🔍 Response data:", data);
        setProfile(data);
      } catch (error) {
        console.error("🔍 Error in loadData:", error);
      }
    }
    loadData();
  }, [isSignedIn, getToken]);

  if (!isSignedIn) return <p>Please sign in first.</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
    </div>
  );
}
