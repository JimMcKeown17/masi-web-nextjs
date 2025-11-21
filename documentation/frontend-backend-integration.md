# Frontend-Backend Integration Patterns

## Philosophy

**Backend-First Approach**: When building new features that require data aggregation or complex processing, create backend endpoints first rather than processing raw data on the frontend.

---

## Frontend Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR
- **Authentication**: Clerk
- **Charts**: react-plotly.js

---

## Standard Data Fetching Pattern

### Using SWR with Clerk Authentication

```typescript
'use client';

import { useAuth } from '@clerk/nextjs';
import useSWR from 'swr';

export default function MyComponent() {
  const { getToken } = useAuth();
  
  // Generic fetcher
  const fetcher = async (url: string) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    
    return response.json();
  };
  
  // Fetch with automatic caching, revalidation
  const { data, error, isLoading } = useSWR(
    '/api/endpoint',
    fetcher
  );
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  
  return <YourContent data={data} />;
}
```

### Benefits of SWR
- Automatic caching
- Revalidation on focus
- Optimistic UI updates
- Deduplication of requests
- Built-in error handling

---

## File Organization

### API Functions
Location: `/src/lib/api/mentors/`

Each API endpoint gets its own file:
```
/src/lib/api/mentors/
  ├── index.ts              # Export all APIs
  ├── dashboard.ts          # getDashboardSummary()
  ├── mentor-visits.ts      # getMentorVisits(), createMentorVisit()
  ├── yebo-visits.ts        # getYeboVisits(), createYeboVisit()
  ├── schools.ts            # getSchools()
  ├── mentors.ts            # getMentors()
  └── visit-frequency.ts    # getVisitFrequency()
```

**Pattern**:
```typescript
// lib/api/mentors/example.ts
import type { ExampleResponse } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getExample(
  token: string,
  params?: { filter?: string }
): Promise<ExampleResponse> {
  const queryParams = new URLSearchParams();
  if (params?.filter) queryParams.append('filter', params.filter);
  
  const url = `${API_URL}/example/${queryParams.toString() ? `?${queryParams}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch example');
  }

  return response.json();
}
```

### TypeScript Types
Location: `/src/lib/types/`

```
/src/lib/types/
  ├── index.ts              # Export all types
  ├── common.ts             # User, School
  ├── dashboard.ts          # DashboardSummary, DashboardFilters
  ├── mentor-visit.ts       # MentorVisit, CreateMentorVisitData
  ├── yebo-visit.ts         # YeboVisit, CreateYeboVisitData
  └── visit-frequency.ts    # VisitFrequencyData, VisitFrequencyResponse
```

**Pattern**:
```typescript
// lib/types/example.ts
export interface Example {
  id: number;
  name: string;
  created_at: string;
}

export interface CreateExampleData {
  name: string;
}

export interface ExampleFilters {
  time_filter?: '7days' | '30days' | '90days' | 'thisyear' | 'all';
  category?: string;
}
```

### Components
Location: `/src/components/[section]/`

```
/src/components/
  ├── mentors/
  │   ├── DashboardStats.tsx
  │   ├── ProgramBreakdown.tsx
  │   ├── VisitFrequencyChart.tsx
  │   └── FilterBar.tsx
  ├── layout/
  │   ├── Navbar.tsx
  │   └── Footer.tsx
  └── ui/                   # Shadcn components
      ├── button.tsx
      ├── card.tsx
      └── skeleton.tsx
```

---

## Handling Loading & Error States

### Skeleton Loaders
Match the visual structure of your content:

```typescript
if (isLoading) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-[500px] rounded-2xl" />
    </div>
  );
}
```

### Error Handling
Provide actionable error messages:

```typescript
if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-5 w-5" />
      <AlertDescription>
        Failed to load data. Please try again.
        {error.message && (
          <div className="mt-3 text-sm font-mono">
            {error.message}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

---

## Design System Patterns

### Used in Mentor Dashboard

#### Card Style
```tsx
<div className="
  rounded-2xl 
  border border-slate-200/50 dark:border-slate-700/50
  bg-gradient-to-br from-white via-white to-slate-50/30 
  dark:from-slate-800/40 dark:via-slate-800/40 dark:to-slate-900/40
  backdrop-blur-sm
  shadow-sm
">
  {/* Content */}
</div>
```

#### Button Variants
```tsx
// Primary action
<button className="
  px-4 py-2 rounded-lg
  bg-blue-600 hover:bg-blue-700
  text-white font-medium
  transition-colors duration-200
">

// Secondary/Ghost
<button className="
  px-4 py-2 rounded-lg
  border border-slate-200 dark:border-slate-700
  hover:bg-slate-50 dark:hover:bg-slate-800
  transition-colors duration-200
">
```

#### Animations
```tsx
// Fade in with slide
<div className="
  animate-in fade-in slide-in-from-bottom-4
" 
style={{ 
  animationDelay: '100ms', 
  animationFillMode: 'backwards' 
}}>

// Staggered animations
{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-in fade-in slide-in-from-bottom-2"
    style={{ 
      animationDelay: `${index * 50}ms`,
      animationFillMode: 'backwards'
    }}
  />
))}
```

#### Icons
Using lucide-react:
```tsx
import { BookOpen, Calendar, TrendingUp } from 'lucide-react';

<BookOpen className="w-5 h-5" strokeWidth={2.5} />
```

---

## Chart Integration (Plotly)

### Dynamic Import (Required)
```tsx
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
```

### Theme-Aware Charts
```typescript
const isDark = typeof window !== 'undefined' && 
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const layout = {
  plot_bgcolor: 'rgba(0,0,0,0)',
  paper_bgcolor: 'rgba(0,0,0,0)',
  font: {
    color: isDark ? '#94a3b8' : '#64748b',
  },
  // ... more config
};
```

---

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.masinyusane.org
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Access in code:
```typescript
// Client-side (must start with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-side only
const secret = process.env.CLERK_SECRET_KEY;
```

---

## When Frontend Processing is OK

Frontend aggregation is acceptable for:
1. **UI State Management**: Filter selections, form state
2. **Small Datasets**: <100 items
3. **Client-Side Only**: Sorting, filtering already-fetched data
4. **Real-Time Updates**: Interactive chart filtering (like program toggles)

Example: The VisitFrequencyChart program filter buttons are frontend-only - they filter already-fetched chart data without re-fetching.

---

## When to Request Backend Endpoints

Request new backend endpoints when:
1. **Fetching >100 records** for processing
2. **Complex aggregations** (GROUP BY, COUNT, AVG across tables)
3. **Data joins** across multiple tables
4. **Performance-critical** operations
5. **Reusable calculations** needed by multiple components

Example: Visit frequency over time fetches ALL visits (potentially thousands) just to count by month. This should be a backend endpoint.

---

## Deployment Considerations

### Build Process
- Next.js builds static and dynamic routes
- Environment variables are baked in at build time
- Clerk middleware runs at edge

### Caching Strategy
- SWR handles client-side caching
- Consider ISR (Incremental Static Regeneration) for public pages
- Use `revalidate` in fetch options for server components

---

## Common Patterns Summary

### Fetch Data with Filters
```typescript
const { data } = useSWR(
  `/api/endpoint?time=${timeFilter}&school=${schoolFilter}`,
  fetcher
);
```

### Create Resource
```typescript
const response = await fetch(`${API_URL}/resource/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});
```

### Conditional Rendering
```typescript
{isLoading ? (
  <Skeleton />
) : data ? (
  <Content data={data} />
) : null}
```

---

## Future Considerations

### Real-Time Updates
Consider WebSockets or Server-Sent Events for:
- Live dashboard updates
- Notifications
- Collaborative editing

### Pagination
When lists grow large:
```typescript
const { data } = useSWR(
  `/api/endpoint?page=${page}&page_size=50`,
  fetcher
);
```

### Optimistic Updates
For better UX on mutations:
```typescript
mutate(
  '/api/visits',
  [...visits, newVisit],
  false // Don't revalidate immediately
);
```

