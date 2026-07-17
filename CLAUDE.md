# Frontend - Next.js Application

Next.js 15 website for Masinyusane (MASI). Communicates with a Django REST Framework backend. Both frontend and backend are fully under your control — add endpoints, modify models, or change auth as needed.

**Git repo:** `https://github.com/JimMcKeown17/masi-web-nextjs`
**Local path:** `/Users/jimmckeown/Development/Masi_Website_2026/frontend/masi-website/`
Always run git commands from this directory — parent directories are NOT git repos.

# Coding Standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever
4. When hitting issues, always identify root cause before trying a fix. Do not guess. Prove with evidence, then fix the root cause.

## Development

```bash
pnpm dev      # http://localhost:3000
pnpm build
pnpm lint
pnpm install  # from root or masi-website/
```

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Data Fetching:** SWR + native fetch
- **Auth:** Clerk (`@clerk/nextjs`)
- **Charts:** react-plotly.js | **Maps:** react-map-gl + MapLibre | **Forms:** react-hook-form + zod | **Animations:** framer-motion

## Building

Default build workflow for Claude: Claude/Fable owns design, spec, review, and verification; delegate non-trivial implementation to Codex via `codex-first`, then inspect the diff and tests before ship.

## Design System

When doing ANY redesign work, or building or restyling website pages, sections, or
UI components, first read `documentation/design-system.md`. It defines the "Ink &
Signal" visual language from the 2026 homepage redesign (live preview at
`/home-v2-preview`, components in `src/components/home/v3/`).

## Routes

**Public:** `/`, `/about/our-team`, `/about/where-we-work`, `/about/apply`, `/programs/early-childhood-education`, `/programs/community-jobs`, `/programs/top-learners`, `/programs/zazi-izandi`, `/impact/`, `/impact/reports`, `/impact/data-portal`, `/impact/annual-report/[year]`, `/media/in-the-news`, `/media/media-resources`, `/donate`, `/privacy`

**Protected** (Clerk — `src/middleware.ts`): `/operations/mentors`, `/operations/youth-sessions`, `/operations/preview`

**Auth:** `/auth/sign-in`, `/auth/sign-up`

**Legacy redirects** (`next.config.ts`): `/children`, `/youth`, `/top-learner`, `/data`, `/where`, `/apply`, `/about`

## Directory Structure

```
src/
├── app/               # App Router pages
├── components/
│   ├── home/          # Homepage sections
│   ├── about/
│   ├── programs/
│   ├── impact/        # Impact visualization
│   ├── media/
│   ├── mentors/       # Mentor dashboard (charts, filters, stats)
│   ├── youth-sessions/ # Youth sessions dashboard (heatmap, coverage, inactive alerts)
│   ├── donate/
│   ├── animations/
│   ├── layout/        # Navbar, Footer
│   ├── pdf/
│   ├── providers/
│   └── ui/            # shadcn/ui components
└── lib/
    ├── api/
    │   ├── mentors/         # Mentor dashboard API functions
    │   └── youth-sessions/  # Youth sessions API functions (7 endpoints)
    ├── types/         # TypeScript type definitions
    ├── server/        # Server-side utilities
    ├── imageUrl.ts    # GCS image/asset URL helper
    └── utils.ts       # Shared utilities (cn, etc.)
```

## Asset Storage

**Google Cloud Storage** (most site images):
- Use `getImageUrl(path)` / `getAssetUrl(path)` from `src/lib/imageUrl.ts`
- Requires `NEXT_PUBLIC_GCS_BUCKET_NAME` env var (falls back to `/public`)

**`/public` folder** (page-specific assets):
- `/public/impact/` — Charts, result graphics, photos
- `/public/media/gallery/` — Gallery images | `/public/media/news/` — News photos
- `/public/reports/` — PDF reports | `/public/zazi-izandi/` — Program assets

## Backend-First Philosophy

Always prefer backend endpoints over frontend for: data aggregation, cross-table calculations, datasets >100 records, centralised business logic.

- ❌ Fetch 1000+ records and aggregate on frontend
- ✅ Create `/api/visit-frequency/` endpoint returning pre-aggregated data

See `documentation/backend-django-notes.md` for more.

## API Integration Pattern

```typescript
// 1. Types in /src/lib/types/
export interface VisitStats { total_visits: number; ... }

// 2. API function in /src/lib/api/<domain>/
export async function getVisitStats(token: string, filters?: { time_filter?: string }) {
  const params = new URLSearchParams();
  if (filters?.time_filter) params.append('time_filter', filters.time_filter);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visit-stats/?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json() as Promise<VisitStats>;
}

// 3. Use with SWR — always handle all three states
const { getToken } = useAuth();
const { data, error, isLoading } = useSWR('/api/visit-stats', async () => {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');
  return getVisitStats(token, { time_filter: '30days' });
});

if (isLoading) return <Skeleton />;
if (error) return <Alert variant="destructive">{error.message}</Alert>;
return <YourComponent data={data} />;
```

## shadcn/ui Components

Pre-configured with path alias `@/components`. Common: Button, Card, Tabs, Select, Badge, Table, Sheet, NavigationMenu.

## Development Workflow

1. Check `documentation/api-endpoints.md` — does the endpoint exist?
2. Define TypeScript types in `/src/lib/types/`
3. Create API function in `/src/lib/api/<domain>/`
4. Build component with loading/error/success states

## Key Documentation


- `documentation/data-architecture.md` — THREE backends/data sources (Zazi iZandi backend via Teampact, Main Masi backend, Airtable) + sync topology + the Airtable→PG audit gap. Read this before assuming where data lives.
- `documentation/api-endpoints.md` — All backend API endpoints
- `documentation/frontend-backend-integration.md` — Data fetching patterns, design system
- `documentation/recommended-backend-endpoints.md` — Endpoints to add
- `documentation/future-improvements.md` — Deferred ideas / backlog. If the user asks what to build next, start here.
- **Agentic fundraising system** (a new backend `fundraising` Django app, built alongside this frontend): plan `_plans/agentic-fundraising-system.md`, domain glossary `CONTEXT.md`, decisions `docs/adr/0001`..`0008`, build specs `_plans/fundraising-spine-spec.md` and `_plans/fundraising-e2e-tracer-spec.md`, photo setup `docs/fundraising-photo-pipeline-setup.md`. The relationship Spine and the newsletter Content Pipe (Airtable Success Stories to Mailchimp drafts) are built and committed on backend branch `feature/fundraising-spine`. For the latest state start from the session handoff `docs/handoff-2026-07-07-fundraising.md`.

## Known Issues

- Visit frequency chart fetches all visits — should use backend aggregation
- No pagination (needed as data grows)
- No real-time updates (manual refresh required)
- Youth sessions "today" stats show 0 after 10pm SAST — Render server runs UTC, not Africa/Johannesburg
- Youth sessions dashboard currently filters to Literacy Coach + Numeracy Coach only — other job titles (Zazi iZandi, ZZ ECD, etc.) excluded pending next version
