# Shepherd AI — Full System Implementation Plan

**Repo:** PERDANA-LLC/shepherd-ai
**Deploy:** bs.thomasperdana.com
**DB:** Supabase hermesdb (shepherd_* tables)
**Auth:** Clerk (live — sign-up, sign-in, protected routes)
**Stack:** Next.js 16 · TypeScript · DeepSeek V3 · KJV Local JSON

---

## CURRENT STATE (What's Built)

| Feature | Status | Notes |
|---------|--------|-------|
| 4-Level Study Generation | ✅ Done | L1–L4 with level-specific JSON schemas |
| KJV Local Bible Lookup | ✅ Done | 31K verses, 70+ aliases in `lib/bible.ts` |
| Strong's Concordance Popovers | ✅ Done | 14K entries, clickable in UI |
| PDF Export | ✅ Done | jsPDF with Unicode sanitizer |
| Christological Root | ✅ Done | System prompt enforced |
| Clerk Auth (sign-up/sign-in) | ✅ Done | Middleware, ClerkProvider, protected /app |
| Landing Page | ✅ Done | / → marketing page with Start Free CTA |
| Vercel Production Deploy | ✅ Done | bs.thomasperdana.com, GitHub auto-deploy |
| Vercel Env Vars | ✅ Done | 9 env vars (Clerk 6 + Supabase 3) |
| Supabase Client | ✅ Done | `src/lib/supabase.ts` wired |
| Supabase Tables | ✅ Done | shepherd_* (7 tables incl. recommendations) |
| **Recommendation Engine** | ✅ Done | 3-tier (beginner/intermediate/expert), journaled |
| DeepSeek V3 Integration | ✅ Done | Fast, works on Vercel Hobby (60s) |
| localStorage History | ⚠️ Partial | 20 entries local — not yet migrated to Supabase |

---

## PHASE 1 — FOUNDATION (Auth + Supabase Wiring)

**Goal:** Users can sign up, log in, and their data persists to Supabase.

### 1.1 Clerk Auth Setup ✅ DONE
- [x] Set up Clerk app (clerk.com) — got publishable key + secret key
- [x] Add Clerk env vars to `.env.local`
- [x] Add Clerk env vars to Vercel (production)
- [x] Create `src/middleware.ts` — Clerk middleware protecting `/app/*` and API routes
- [x] Wrap app with `<ClerkProvider>` in `layout.tsx`
- [x] Create sign-in page at `/sign-in` and sign-up at `/sign-up`
- [x] App shell with UserButton in header at `/app`
- [x] Test: middleware redirect works (307 → /sign-in for unauthenticated)

### 1.2 Study History → Supabase (Replace localStorage)
- [ ] Create `/api/history` route (GET list, POST save, DELETE clear)
- [ ] Save each generated study to `shepherd_studies` table
- [ ] Load history from Supabase instead of localStorage
- [ ] Keep localStorage as fallback for non-authenticated users
- [ ] Add `created_at` filter — show user's study history sorted by date
- [ ] Test: 2 users, each sees only their own history

### 1.3 User Profile Auto-Creation
- [ ] When user signs up, create row in `shepherd_profiles` via Clerk webhook or on first study
- [ ] Default: `study_level: 1, teacher_level: 1`
- [ ] Link profile to Clerk user ID

### 1.4 Vercel Env Sync ✅ DONE
- [x] Set Supabase env vars on Vercel
- [x] Set Clerk env vars on Vercel
- [x] Deploy and verify auth + Supabase work in production

---

## PHASE 2 — BS5 CORE (Assessment + Journal)

**Goal:** Users can assess their level and keep a private journal.

### 2.1 Assessment Engine
- [ ] Build assessment page at `/app/assess`
- [ ] 7 dimensions × 3 questions each = 21 questions
- [ ] Progress bar showing questions remaining
- [ ] Auto-calculate level from average score
- [ ] Save assessment results to `shepherd_assessments`
- [ ] Update `shepherd_profiles.study_level` based on assessment
- [ ] Show results: radar chart of 7 dimensions with recommended path

### 2.2 Journal System
- [ ] Build journal page at `/app/journal`
- [ ] Journal entry form matching bs5 structure
- [ ] Save to `shepherd_journals` table
- [ ] Privacy enforcement: `prayer` and `struggle` fields have NO share toggle
- [ ] CRUD: view past entries, edit, delete
- [ ] "Save Study + Journal" button on study results page

### 2.3 Dashboard
- [ ] Build `/app` as dashboard (currently just study generator)
- [ ] Widgets: recent studies, recent journals, assessment score, streak
- [ ] "Continue where you left off" — last study or journal entry

---

## PHASE 3 — CURRICULUM PATHS

### 3.1 Curriculum Engine
- [ ] Build curriculum page at `/app/curriculum`
- [ ] 4 paths: Seeker's (12wk), Disciple's (16wk), Teacher's (24wk), Scholar's (ongoing)
- [ ] Path data as TypeScript config

### 3.2 Module Tracker
- [ ] Track module completion to `shepherd_progress`
- [ ] Progress bar + next module prompt

### 3.3 Workbook Generation (BS4)
- [ ] Create `/api/workbook` route
- [ ] Save to `shepherd_workbooks`
- [ ] PDF export for workbooks

---

## PHASE 4 — FLYWHEEL ANALYTICS

### 4.1 Flywheel Data Collection
- [ ] Track: study count, journal frequency, level progression

### 4.2 30-Day Flywheel Report
- [ ] Build flywheel page at `/app/flywheel`
- [ ] 7-dimension scorecard with narrative feedback
- [ ] Plateau detection

### 4.3 Growth Visualization
- [ ] Level progression timeline, calendar heatmap, radar chart

---

## PHASE 5 — COMMUNITY + SHARING

- [ ] Privacy-first sharing engine (hard blocks on prayer/struggle)
- [ ] Share Snippet, Anonymous Testimony, link sharing

---

## PHASE 6 — TEACHER TOOLS + TONA GROUP

- [ ] Group management, teacher dashboard, leader's guide generator

---

## PHASE 7 — POLISH + LAUNCH

- [ ] Mobile responsive, performance optimization, testing + QA

---

## NEW: RECOMMENDATION ENGINE ✅ DONE

| Feature | Status |
|---------|--------|
| `/api/recommend` — DeepSeek 3-tier recommendations | ✅ Live |
| `/api/recommend/accept` — save to Supabase | ✅ Live |
| UI panel after study results | ✅ Live |
| `shepherd_recommendations` table | ✅ Live |

---

## FILE STRUCTURE (Current)

```
src/
├── app/
│   ├── page.tsx                → Landing page
│   ├── layout.tsx              → ClerkProvider + global layout
│   ├── app/
│   │   ├── page.tsx            → Study generator + recommendations
│   │   └── layout.tsx          → App shell (nav + UserButton)
│   ├── sign-in/[[...sign-in]]/  → Clerk sign-in
│   └── sign-up/[[...sign-up]]/  → Clerk sign-up
├── api/
│   ├── study/route.ts          → Study generation
│   ├── strongs/route.ts        → Strong's lookup
│   ├── recommend/route.ts      → 3-tier recommendations
│   └── recommend/accept/route.ts → Save accepted recommendation
├── lib/
│   ├── bible.ts                → KJV lookup
│   ├── christological-root.ts  → Root prompt
│   ├── pdf.ts                  → PDF export
│   └── supabase.ts             → DB client
└── middleware.ts                → Clerk auth guard
```

---

## KEY CONSTRAINTS

| Constraint | Impact |
|-----------|--------|
| Vercel Hobby 60s timeout | DeepSeek V3 (3–15s) ✅ |
| Supabase free tier 500MB | Monitor as journals grow |
| Clerk free tier 10K MAU | Fine for TONA group |
| Local KJV JSON (6.4MB) | Committed to git |
