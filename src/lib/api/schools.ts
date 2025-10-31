// lib/api/schools.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getSchools(token: string) {
  const response = await fetch(`${API_URL}/schools/`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  return response.json();
}