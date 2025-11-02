// lib/api/mentor-visits.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMentorVisits(
  token: string,
  filters?: {
    time_filter?: string;
    school?: string;
    mentor?: string;
  }
) {
  const params = new URLSearchParams();
  if (filters?.time_filter) params.append('time_filter', filters.time_filter);
  if (filters?.school) params.append('school', filters.school);
  if (filters?.mentor) params.append('mentor', filters.mentor);
  
  const response = await fetch(`${API_URL}/mentor-visits/?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  return response.json();
}

export async function createMentorVisit(token: string, data: any) {
  const response = await fetch(`${API_URL}/mentor-visits/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return response.json();
}

export async function updateMentorVisit(token: string, id: number, data: any) {
  const response = await fetch(`${API_URL}/mentor-visits/${id}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return response.json();
}