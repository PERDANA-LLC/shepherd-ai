# Shepherd AI — Developer Guide

**Repository:** PERDANA-LLC/shepherd-ai
**Deployment:** Vercel (Hobby) · https://bs.thomasperdana.com
**Stack:** Next.js 16 (App Router) · TypeScript · Clerk Auth · Supabase PG 17 · DeepSeek V3

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Hobby)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Next.js 16 App Router                │   │
│  │                                                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │   │
│  │  │  Pages   │  │  API     │  │  Components   │  │   │
│  │  │  10 app  │  │  16 routes│  │  12 components│  │   │
│  │  │  pages   │  │          │  │              │  │   │
│  │  └──────────┘  └──────────┘  └───────────────┘  │   │
│  │        │              │              │           │   │
│  │        ▼              ▼              ▼           │   │
│  │  ┌──────────────────────────────────────────┐    │   │
│  │  │              src/lib/ (8 modules)         │    │   │
│  │  │  bible · theological-root · chain-ref    │    │   │
│  │  │  intertestament · curriculum · pdf       │    │   │
│  │  │  supabase                                 │    │   │
│  │  └──────────────────────────────────────────┘    │   │
│  │        │              │                          │   │
│  └────────┼──────────────┼──────────────────────────┘   │
│           ▼              ▼                              │
│  ┌────────────┐  ┌──────────────┐                       │
│  │  Supabase  │  │  DeepSeek V3 │                       │
│  │  PG 17     │  │  (OpenRouter) │                      │
│  │  14 tables │  └──────────────┘                       │
│  └────────────┘                                         │
│                                                         │
│  ┌────────────┐                                         │
│  │   Clerk    │                                         │
│  │   Auth     │                                         │
│  │  Google    │                                         │
│  │  GitHub    │                                         │
│  │  Facebook  │                                         │
│  └────────────┘                                         │
│                                                         │
│  ┌────────────┐                                         │
│  │  KJV JSON  │  data/kjv.json (31,102 verses, 6.4MB)  │
│  │  Local     │  Strong's JSON (14,197 entries, 3.7MB)  │
│  └────────────┘                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
shepherd-ai/
├── data/                          # Static data (NOT in src/)
│   └── kjv.json                   # 31,102 KJV verses
├── public/
│   ├── privacy.html               # Privacy policy
│   ├── icon-*.png                 # App icons (all sizes)
│   └── favicon.ico
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── page.tsx               # Landing page (unauthenticated)
│   │   ├── layout.tsx             # Root layout + metadata
│   │   ├── app/                   # Authenticated app shell
│   │   │   ├── page.tsx           # Study generator + dashboard
│   │   │   ├── layout.tsx         # App nav (8 links)
│   │   │   ├── assess/            # 21-question diagnostic
│   │   │   ├── journal/           # Private journal + fruit tracker
│   │   │   ├── curriculum/        # 4 paths × 64 modules
│   │   │   ├── workbook/          # Workbook generator + PDF
│   │   │   ├── flywheel/          # 30-day growth analytics
│   │   │   ├── community/         # Sharing + testimony wall
│   │   │   └── groups/            # Study groups + leader guide
│   │   ├── sign-in/               # Clerk sign-in
│   │   ├── sign-up/               # Clerk sign-up
│   │   ├── not-found.tsx          # 404 page
│   │   └── error.tsx              # Global error boundary
│   ├── api/                       # API routes (16 total)
│   │   ├── study/                 # Study generation (DeepSeek)
│   │   ├── strongs/               # Strong's concordance lookup
│   │   ├── assess/                # Assessment save/load
│   │   ├── history/               # Study history CRUD
│   │   ├── profile/               # User profile
│   │   ├── journal/               # Journal CRUD + fruit scores
│   │   ├── recommend/             # 3-tier recommendations
│   │   ├── workbook/              # Workbook generation
│   │   ├── flywheel/              # Analytics aggregation
│   │   ├── share/                 # Community sharing
│   │   ├── testimony/             # Testimony wall
│   │   ├── groups/                # Group management
│   │   ├── leader-guide/          # Leader's guide generation
│   │   ├── chain/                 # Thompson Chain Reference
│   │   └── intertestament/        # OT↔NT cross-references
│   ├── components/                # React components (3)
│   │   ├── ChainReference.tsx     # Thompson chain reference panel
│   │   ├── IntertestamentRefs.tsx # OT↔NT cross-reference panel
│   │   └── RadarChart.tsx         # SVG radar chart
│   ├── data/                      # Curated data (2 modules)
│   │   ├── chain-topics.ts        # 50 Thompson-style topic chains
│   │   └── intertestament-connections.ts  # 24 OT↔NT connections
│   ├── lib/                       # Core libraries (8 modules)
│   │   ├── bible.ts               # KJV lookup (fs-based)
│   │   ├── theological-root.ts    # System prompts (3 modes)
│   │   ├── chain-reference.ts     # Chain traversal + AI prompt
│   │   ├── intertestament.ts      # Enrichment + AI prompt
│   │   ├── curriculum.ts          # 64-module curriculum data
│   │   ├── pdf.ts                 # jsPDF export
│   │   └── supabase.ts            # Supabase client
│   ├── middleware.ts              # Clerk auth guard
│   └── proxy.ts                   # Next.js 16 proxy
├── .env.local                     # Local env vars (gitignored)
├── .env                           # Production env vars (gitignored)
├── plan_todo.md                   # Implementation plan
├── user_guide.md                  # End-user documentation
├── developer_guide.md             # This file
└── next.config.ts                 # Next.js config
```

---

## Environment Variables

Set in Vercel dashboard and `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk backend key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (migrations) |
| `OPENROUTER_API_KEY` | OpenRouter API key (DeepSeek) |
| `DEEPSEEK_API_KEY` | Direct DeepSeek key (fallback) |
| `GH_TOKEN` | GitHub personal access token (pushes) |

---

## Database (Supabase — hermesdb, PG 17)

All tables prefixed with `shepherd_` in the public schema:

| Table | Purpose |
|---|---|
| `shepherd_profiles` | User profiles (Clerk-linked) |
| `shepherd_studies` | Study history |
| `shepherd_journals` | Journal entries + fruit scores |
| `shepherd_fruit_scores` | Fruit tracker time series |
| `shepherd_assessments` | Assessment results |
| `shepherd_workbooks` | Generated workbooks |
| `shepherd_recommendations` | 3-tier recommendations |
| `shepherd_progress` | Curriculum/module progress |
| `shepherd_shares` | Community shared content |
| `shepherd_testimonies` | Anonymous testimonies |
| `shepherd_prayer_requests` | Opt-in prayer sharing |
| `shepherd_groups` | Study groups |
| `shepherd_group_members` | Group membership |
| `shepherd_leader_guides` | Leader's guides |

---

## API Design Patterns

### Study Generation (`POST /api/study`)
```typescript
// Request
{ passage: "John 3:16", level: 3, focus: "christological" }

// Response
{ 
  success: true, 
  reference: "John 3:16", 
  translation: "KJV",
  level: 3,
  level_name: "College",
  study: { /* level-specific JSON structure */ }
}
```

### Chain Reference (`GET /api/chain`)
```typescript
// Query params: ?verse=, ?id=, ?topic=, ?category=
// POST for AI generation: { passage: "John 3:16", focus: "christological" }
```

### Intertestament (`GET /api/intertestament`)
```typescript
// Query params: ?passage=, ?search=, ?ai=true&focus=
```

---

## Key Libraries

### bible.ts — KJV Lookup
- Loads `data/kjv.json` via `fs.readFileSync` (Node.js runtime only)
- `lookupPassage(ref)` → `{ reference, verses[], error? }`
- `versesToText(verses)` → joined verse text
- Handles 70+ book name aliases

### theological-root.ts — AI System Prompts
- `buildSystemPrompt(focus)` — returns AI system prompt
- Three focus modes: `christological`, `trinitarian`, `theological`
- Injects Hope/Faith/Love (1 Cor 13:13) requirements

### chain-reference.ts — Thompson Chains
- `buildChainContext(id, ref)` → chain with position tracking
- `buildChainContextWithTexts(id, ref)` → with KJV verse texts
- `buildChainPrompt(passage, text, focus)` → DeepSeek prompt
- `parseReference(ref)` → { book, chapter, verse }

### intertestament.ts — Cross-Testament
- `findIntertestamentConnections(ref)` → curated matches
- `enrichConnections(entry)` → add full verse texts
- `buildIntertestamentPrompt(passage, text, focus)` → DeepSeek prompt

---

## DeepSeek Integration

All AI calls go through OpenRouter:
```
POST https://openrouter.ai/api/v1/chat/completions
Model: deepseek/deepseek-chat
```

**JSON Extraction:** DeepSeek V3 wraps JSON in ```json fences. The API routes handle this:
```typescript
const cleaned = rawContent
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();
```

**Fallback:** If the cleaned string isn't valid JSON, try to extract via regex: `rawContent.match(/\{[\s\S]*\}/)`.

---

## Constraints & Limits

| Constraint | Impact |
|---|---|
| Vercel Hobby 60s timeout | DeepSeek responses (3-15s) fit comfortably |
| Vercel Hobby 1MB payload | Study responses are under limit |
| Supabase 500MB free tier | Monitor as usage grows |
| Clerk 10K MAU free tier | Fine for current scale |
| KJV JSON 6.4MB | Loaded synchronously at startup |
| DeepSeek rate limits | OpenRouter handles queuing |

---

## Build & Deploy

```bash
# Local dev
npm run dev

# Build
npm run build    # Next.js 16 with Turbopack

# Deploy
git push origin main    # Vercel auto-deploys from main branch
```

**Push authentication:**
```bash
source .env
git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/PERDANA-LLC/shepherd-ai.git"
git push origin main
```

---

## Adding New Features

### Pattern: Feature with AI + Curated Data
1. Create curated data in `src/data/` (TypeScript module)
2. Create logic library in `src/lib/` (lookup, enrichment, AI prompt builder)
3. Create API route in `src/app/api/<feature>/route.ts`
4. Create React component in `src/components/`
5. Import and add to `src/app/app/page.tsx`
6. Build → push → Vercel auto-deploys

### Privacy Rules
- Prayer, struggle, and prayer_request fields must NEVER leave private API context
- Sharing endpoints (`/api/share`, `/api/testimony`) strip these fields before insert
- Journal privacy locks are API-enforced, not just UI-level

---

## Testing

```bash
# Test chain reference API
curl "https://bs.thomasperdana.com/api/chain?verse=John+3:16"

# Test intertestament API
curl "https://bs.thomasperdana.com/api/intertestament?passage=Isaiah+53:5"

# Test study generation (authenticated)
# Use browser → sign in → study a passage
```

---

## Phase History

| Phase | Description | Status |
|---|---|---|
| 1 | Foundation (Clerk, Supabase, Vercel) | ✅ |
| 2 | BS5 Core (Assessment, Journal, Fruit) | ✅ |
| 3 | Curriculum Paths + Workbooks | ✅ |
| 4 | Flywheel Analytics | ✅ |
| 5 | Community + Sharing | ✅ |
| 6 | Teacher Tools + Groups | ✅ |
| 7 | Polish + Launch | ✅ |
| 8 | Theological Root Upgrade (3 modes) | ✅ |
| 9 | Cross-Reference Tools (Chain + Intertestament) | ✅ |
