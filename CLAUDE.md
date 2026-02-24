# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 website for Masinyusane (MASI), an educational non-profit in South Africa. The frontend communicates with a separate Django REST Framework backend for managing mentor visits, programs, children's data, and impact data.

**Backend Control:** Both the frontend (this repository) and backend Django API are fully under your control. You can freely add new endpoints, modify auth logic, update database models, or make any other backend changes as needed.

**CRITICAL: Repository Location**

This repository (`masi-web-nextjs`) is located at:
- **Local path:** `/Users/jimmckeown/Development/Masi_Website_2026/frontend/masi-website/`
- **GitHub URL:** `https://github.com/JimMcKeown17/masi-web-nextjs`
- **Working directory:** Always `cd` to `frontend/masi-website` before running git commands
- **Important:** The parent directories (`Masi_Website_2026/` and `frontend/`) are NOT git repositories

**Monorepo Structure:**
- `/masi-website/` - Next.js 15 application (main development workspace)
- Root `/` - pnpm workspace configuration

# Development
pnpm dev              # Start dev server on http://localhost:3000
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Package management
pnpm install          # Install dependencies (run from root or masi-website/)
```

## Architecture

### Frontend Stack
- **Framework:** Next.js 15 with App Router (React 19)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Data Fetching:** SWR for client-side caching
- **Authentication:** Clerk (JWT tokens)
- **Charts:** react-plotly.js
- **Maps:** react-map-gl with MapLibre
- **Forms:** react-hook-form + zod validation
- **Animations:** framer-motion

### Backend Integration
- **Backend:** Separate Django REST Framework repository (user-controlled)
- **API URL:** Set via `NEXT_PUBLIC_API_URL` environment variable
- **Auth Flow:** Clerk JWT tokens passed in `Authorization: Bearer <token>` headers
- **Documentation:** See `/masi-website/documentation/` for comprehensive API docs

### Routes

**Public routes** (no auth required):
- `/` — Homepage
- `/about/our-team` — Team page
- `/about/where-we-work` — Map and location info
- `/about/apply` — Application page
- `/programs/early-childhood-education` — ECD program
- `/programs/community-jobs` — Youth employment program
- `/programs/top-learners` — Top learners program
- `/programs/zazi-izandi` — Zazi iZandi literacy program
- `/impact/` — Impact overview page
- `/impact/reports` — Impact reports
- `/impact/data-portal` — Data visualization portal
- `/impact/annual-report/[year]` — Dynamic annual report pages (e.g. `/impact/annual-report/2024`)
- `/media/in-the-news` — News coverage
- `/media/media-resources` — Media/gallery resources
- `/donate` — Donation page
- `/privacy` — Privacy policy

**Protected routes** (Clerk auth required — configured in `src/middleware.ts`):
- `/operations/mentors` — Mentor dashboard

**Auth routes:**
- `/auth/sign-in` — Clerk sign-in
- `/auth/sign-up` — Clerk sign-up

**Legacy redirects** (configured in `next.config.ts`):
- `/children` → `/programs/early-childhood-education`
- `/youth` → `/programs/community-jobs`
- `/top-learner` → `/programs/top-learners`
- `/data` → `/impact/data-portal`
- `/where` → `/about/where-we-work`
- `/apply` → `/about/apply`
- `/about` → `/about/our-team`

### Directory Structure

```
masi-website/src/
├── app/                    # Next.js App Router pages (see Routes above)
├── components/
│   ├── home/              # Homepage sections
│   ├── about/             # About page components
│   ├── programs/          # Program-specific components
│   ├── impact/            # Impact visualization components
│   ├── media/             # News and media components
│   ├── mentors/           # Mentor dashboard components (charts, filters, stats)
│   ├── donate/            # Donation page components
│   ├── animations/        # Shared animation components
│   ├── layout/            # Navbar, Footer
│   ├── pdf/               # PDF viewer components
│   ├── providers/         # Context providers
│   └── ui/                # shadcn/ui components (Button, Card, etc.)
├── lib/
│   ├── api/mentors/       # API functions for backend integration
│   ├── types/             # TypeScript type definitions
│   ├── server/            # Server-side utilities
│   ├── imageUrl.ts        # GCS image/asset URL helper (see Asset Storage below)
│   └── utils.ts           # Shared utilities (cn, etc.)
└── middleware.ts          # Clerk auth middleware
```

### Asset Storage (Images, PDFs, Videos)

Assets are split between two locations:

**Google Cloud Storage (GCS)** — primary location for most site images:
- Bucket: `masi-website` on `storage.googleapis.com`
- Use `getImageUrl(path)` or `getAssetUrl(path)` from `src/lib/imageUrl.ts` to build URLs
- Requires `NEXT_PUBLIC_GCS_BUCKET_NAME` env var; falls back to local `/public` path if unset
- Remote patterns configured in `next.config.ts` for Next.js Image optimization

**`/public` folder** — used for page-specific assets that were added directly:
- `/public/impact/` — Impact page charts, result graphics, photos
- `/public/impact/results/` — EGRA/literacy result charts (SVGs and PNGs)
- `/public/media/gallery/` — Photo gallery images
- `/public/media/news/` — News article screenshots/photos
- `/public/reports/` — PDF reports (Annual Report, Graduates Magazine)
- `/public/zazi-izandi/` — Zazi iZandi program assets (hero video, logos, sponsor logos, research PDF, images)
- `/public/` root — Logos, favicon, misc SVGs

## Backend-First Philosophy

**Critical Principle:** Always prefer backend endpoints over frontend processing for:
- Data aggregation (monthly/weekly summaries, GROUP BY operations)
- Complex calculations across multiple database tables
- Large datasets (>100 records)
- Business logic that should be centralized

**Example:**
- ❌ Bad: Fetch 1000+ visit records and aggregate on frontend
- ✅ Good: Create `/api/visit-frequency/` endpoint returning pre-aggregated data

See `/masi-website/documentation/backend-django-notes.md` for detailed guidance.

## API Integration Pattern

All existing API calls follow this pattern:

```typescript
// 1. Define types in /src/lib/types/
export interface VisitStats {
  total_visits: number;
  literacy_visits: number;
  // ...
}

// 2. Create API function in /src/lib/api/mentors/
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getVisitStats(
  token: string,
  filters?: { time_filter?: string }
): Promise<VisitStats> {
  const params = new URLSearchParams();
  if (filters?.time_filter) params.append('time_filter', filters.time_filter);

  const response = await fetch(
    `${API_URL}/visit-stats/${params.toString() ? `?${params}` : ''}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!response.ok) throw new Error('Failed to fetch visit stats');
  return response.json();
}

// 3. Use in component with SWR
import { useAuth } from '@clerk/nextjs';
import useSWR from 'swr';

const { getToken } = useAuth();
const { data, error, isLoading } = useSWR(
  '/api/visit-stats',
  async (url) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return getVisitStats(token, { time_filter: '30days' });
  }
);
```

## Authentication Flow

- **Public Routes:** `/`, `/about/*`, `/programs/*`, `/impact/*`, `/donate`, `/media/*`, `/privacy`
- **Protected Routes:** `/operations/*` (requires Clerk authentication)
- **Middleware:** See `src/middleware.ts` for route protection configuration
- **Backend Auth:** Clerk JWT tokens are validated on Django backend

## Key Documentation Files

Before implementing features, consult:

1. **`/masi-website/documentation/api-endpoints.md`**
   - Complete list of all available backend API endpoints
   - Query parameters, response formats, examples

2. **`/masi-website/documentation/frontend-backend-integration.md`**
   - Data fetching patterns with SWR + Clerk
   - Component organization
   - Design system patterns
   - Loading/error state handling

3. **`/masi-website/documentation/recommended-backend-endpoints.md`**
   - Prioritized list of endpoints to request from backend
   - Includes implementation guides for high-priority features

4. **`.cursor/rules/`**
   - `project-overview.mdc` - Backend-first philosophy
   - `api-integration.mdc` - API function templates
   - `backend-requests.mdc` - When to request new endpoints

## Component Patterns

### shadcn/ui Components
Pre-configured in `components.json` with:
- Path alias: `@/components`
- Tailwind CSS integration
- TypeScript support

Common components: Button, Card, Tabs, Select, Badge, Table, Sheet, NavigationMenu

### Design System
- **Colors:** Use Tailwind color classes
- **Typography:** Tailwind typography utilities
- **Spacing:** Consistent with Tailwind spacing scale
- **Responsive:** Mobile-first design

### Data Fetching
Always handle three states:
```typescript
if (isLoading) return <Skeleton />;
if (error) return <Alert variant="destructive">Error: {error.message}</Alert>;
return <YourComponent data={data} />;
```

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## TypeScript Configuration

- **Path Alias:** `@/*` maps to `./src/*`
- **Target:** ES2017
- **Strict Mode:** Enabled
- All API types should be defined in `/src/lib/types/`

## Deployment Notes

- **Images:** Configured for Google Cloud Storage at `storage.googleapis.com/masi-website/**`
- **Build:** Standard Next.js build process
- **Environment:** Ensure all env variables are set in production

## Development Workflow

When adding new features:

1. Check if required API endpoint exists in `documentation/api-endpoints.md`
2. If endpoint missing, document the need and request from backend (see `backend-requests.mdc`)
3. Create TypeScript types in `/src/lib/types/`
4. Create API function in `/src/lib/api/mentors/`
5. Build component with proper loading/error states
6. Follow established design patterns from similar components
7. Update documentation if adding new patterns or endpoints

## Known Issues & Technical Debt

- Visit frequency chart currently fetches all visits (should use backend aggregation endpoint)
- No pagination implemented (will be needed as data grows)
- No real-time updates (requires manual refresh)
