# NTU Past Papers Archive — Architecture Guide

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **Deployment**: Vercel + Supabase

## Folder Structure

```
ntu-past-papers/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Redirect to /papers
│   │   ├── papers/
│   │   │   └── page.tsx                # Past Papers listing
│   │   ├── contribute/
│   │   │   └── page.tsx                # Contribute form
│   │   ├── leaderboard/
│   │   │   └── page.tsx                # Leaderboard
│   │   └── contributors/
│   │       └── [rollNumber]/
│   │           └── page.tsx            # Contributor profile
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── admin/
│   │       ├── page.tsx                # Dashboard
│   │       ├── departments/page.tsx
│   │       ├── teachers/page.tsx
│   │       ├── subjects/page.tsx
│   │       ├── pending/page.tsx
│   │       ├── approved/page.tsx
│   │       ├── rejected/page.tsx
│   │       ├── contributors/page.tsx
│   │       └── leaderboard/page.tsx
│   └── api/
│       ├── papers/
│       │   ├── route.ts                # GET papers (filtered)
│       │   └── [id]/route.ts           # GET single paper
│       ├── contribute/
│       │   └── route.ts                # POST submit paper
│       ├── admin/
│       │   ├── approve/route.ts
│       │   ├── reject/route.ts
│       │   ├── departments/route.ts
│       │   ├── teachers/route.ts
│       │   └── subjects/route.ts
│       └── leaderboard/
│           └── route.ts
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── papers/
│   │   ├── PaperCard.tsx
│   │   ├── PaperFilters.tsx
│   │   ├── PaperGrid.tsx
│   │   ├── PaperViewer.tsx             # Inline PDF viewer
│   │   └── PaperActions.tsx
│   ├── contribute/
│   │   ├── ContributeForm.tsx
│   │   └── RollNumberParser.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── PaperReviewCard.tsx
│   │   └── DataTable.tsx
│   ├── leaderboard/
│   │   └── LeaderboardTable.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── Watermark.tsx
│       └── SearchBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   └── admin.ts                    # Service role client
│   ├── utils/
│   │   ├── rollNumber.ts               # Roll number parser
│   │   ├── fileProcessor.ts            # File validation + compress
│   │   ├── watermark.ts                # Watermark injection
│   │   └── rateLimit.ts
│   ├── validations/
│   │   └── schemas.ts                  # Zod schemas
│   └── constants.ts
├── actions/
│   ├── papers.ts                       # Server actions
│   ├── contribute.ts
│   └── admin.ts
├── types/
│   └── index.ts                        # All TypeScript types
├── middleware.ts                        # Admin route protection
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── seed.sql
```
