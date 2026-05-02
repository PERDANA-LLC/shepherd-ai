# Shepherd AI — Developer Guide

**Repo:** https://github.com/PERDANA-LLC/shepherd-ai
**Production:** https://bs.thomasperdana.com
**Stack:** Next.js 16 (Turbopack) · TypeScript · Tailwind CSS v4

---

## Quick Start

```bash
git clone https://github.com/PERDANA-LLC/shepherd-ai.git
cd shepherd-ai
cp .env.local.example .env.local   # or ask Thomas for keys
npm install
npm run dev                          # http://localhost:3000
```

---

## Environment Variables

Required in `.env.local`:

```bash
# DeepSeek (via OpenRouter)
DEEPSEEK_API_KEY=sk-or-v1-...
DEEPSEEK_BASE_URL=https://openrouter.ai/api/v1
DEEPSEEK_MODEL=deepseek/deepseek-chat

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

# Supabase (Global DB — hermesdb)
NEXT_PUBLIC_SUPABASE_URL=https://fyflkeorqujrlgtxfbtr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Browser                                                  │
│  ├── /              → Landing page (public)               │
│  ├── /sign-in       → Clerk sign-in                       │
│  ├── /sign-up       → Clerk sign-up                       │
│  └── /app           → Protected app (Clerk middleware)    │
│       ├── Study generator + recommendations               │
│       ├── /app/journal (planned)                          │
│       ├── /app/assess (planned)                           │
│       └── /app/curriculum (planned)                       │
├──────────────────────────────────────────────────────────┤
│  API Routes (Next.js serverless)                          │
│  ├── POST /api/study           → DeepSeek study gen       │
│  ├── GET  /api/strongs         → Strong's lookup          │
│  ├── POST /api/recommend       → 3-tier recommendations   │
│  └── POST /api/recommend/accept → Save to Supabase        │
├──────────────────────────────────────────────────────────┤
│  Supabase (hermesdb)                                      │
│  ├── shepherd_profiles          → User profiles           │
│  ├── shepherd_studies           → Generated studies       │
│  ├── shepherd_workbooks         → Generated workbooks     │
│  ├── shepherd_journals          → Private journal entries │
│  ├── shepherd_assessments       → Growth assessments      │
│  ├── shepherd_progress          → Activity log            │
│  └── shepherd_recommendations   → Accepted recommendations│
└──────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Clerk auth guard — protects `/app/*` |
| `src/app/layout.tsx` | ClerkProvider wrapper |
| `src/app/page.tsx` | Landing page (marketing) |
| `src/app/app/layout.tsx` | App shell — nav bar + UserButton |
| `src/app/app/page.tsx` | Study generator + recommendation panel |
| `src/app/api/study/route.ts` | Study generation API (DeepSeek) |
| `src/app/api/recommend/route.ts` | Recommendation engine (DeepSeek) |
| `src/app/api/recommend/accept/route.ts` | Save recommendation to Supabase |
| `src/lib/bible.ts` | KJV Bible lookup (70+ aliases) |
| `src/lib/christological-root.ts` | Christological Root system prompt |
| `src/lib/pdf.ts` | jsPDF export with Unicode sanitizer |
| `src/lib/supabase.ts` | Supabase client + schema helpers |

---

## API Reference

### POST /api/study
Generates a 4-level Bible study.

**Request:**
```json
{
  "passage": "John 3:16",
  "level": 3
}
```

**Response:**
```json
{
  "success": true,
  "reference": "John 3:16",
  "translation": "King James Version (local)",
  "level": 3,
  "level_name": "College",
  "study": {
    "passage_reference": "John 3:16",
    "passage_text": "For God so loved the world...",
    "thesis_statement": "...",
    "text_and_context": { ... },
    "word_study": { ... },
    ...
  }
}
```

**Levels:** 1 (5th Grade), 2 (High School), 3 (College, default), 4 (PhD)
**Timeout:** 60s (Vercel Hobby max) — DeepSeek V3 responds in 3-15s

### POST /api/recommend
Generates 3-tier recommendations after a study.

**Request:**
```json
{
  "passage": "John 3:16",
  "level": 2,
  "context": "study_complete"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "tier": "beginner",
      "label": "Explore God's Love in 1 John 4:9-10",
      "description": "Deepen your understanding...",
      "action": "Read and reflect on 1 John 4:9-10",
      "next_passage": "1 John 4:9-10",
      "reason": "This passage reinforces the message..."
    },
    // ... intermediate, expert
  ],
  "context": "study_complete",
  "generated_at": "2026-05-02T22:08:00.214Z"
}
```

### POST /api/recommend/accept
Saves a selected recommendation to Supabase.

**Request:**
```json
{
  "passage": "John 3:16",
  "level": 2,
  "tier": "beginner",
  "label": "Explore God's Love",
  "action": "Read 1 John 4:9-10",
  "next_passage": "1 John 4:9-10",
  "reason": "Reinforces the message"
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid",
  "message": "Recommendation accepted and journaled"
}
```

---

## Deploying

```bash
# Set permanent env vars (do NOT use --env flag)
echo "value" | vercel env add KEY production

# Deploy
vercel deploy --prod --yes --token=$VERCEL_TOKEN

# Or push to main (auto-deploys via GitHub integration)
git push origin main
```

**Vercel Env Vars Required:**
- `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- All `NEXT_PUBLIC_CLERK_*` redirect URLs
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Data Layer (Supabase)

All tables are in the `public` schema with prefixes:

### shepherd_profiles
```sql
id UUID PK, display_name TEXT, email TEXT UNIQUE,
study_level INT (1-4), teacher_level INT (1-4),
created_at, updated_at
```

### shepherd_studies
```sql
id UUID PK, user_id UUID FK→profiles,
passage TEXT, level INT (1-4), title TEXT,
content JSONB, christological_root TEXT, created_at
```

### shepherd_recommendations
```sql
id UUID PK, user_id TEXT, study_id UUID FK→studies,
passage TEXT, level INT, tier TEXT (beginner|intermediate|expert),
label TEXT, description TEXT, action TEXT,
next_passage TEXT, reason TEXT,
status TEXT (pending|accepted|completed|dismissed),
accepted_at, completed_at, created_at
```

### Access Pattern
- **Client-side:** Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` + RLS policies
- **Server-side / VPS scripts:** Use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- **Raw SQL:** Management API with `SUPABASE_ACCESS_TOKEN`

---

## Model Selection

| Model | Latency | Works on Hobby (60s)? |
|-------|---------|----------------------|
| `deepseek/deepseek-chat` (V3) | 3–15s | ✅ Yes — production |
| `deepseek/deepseek-v4-pro` | 50–90s | ❌ Times out |
| `openai/gpt-4o` | 10–30s | ✅ Usually |

**DeepSeek V3 quirk:** Wraps JSON in ` ```json ``` ` fences. Strip with:
```typescript
if (content.startsWith("```")) {
  content = content.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
}
```

---

## Known Issues

1. **Next.js 16 middleware deprecation warning:** `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` — Rename `middleware.ts` → `proxy.ts` when ready (cosmetic only, no functional impact).

2. **pdf.js emoji rendering:** Helvetica default font doesn't support Unicode emoji. Use plain ASCII headers in PDF output.

3. **Clerk v7 `auth()` is async:** Must `await auth()` — returns `Promise<SessionAuth>`, not a direct object.
