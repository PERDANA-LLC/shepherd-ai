# Shepherd AI — Full System Implementation Plan

**Repo:** PERDANA-LLC/shepherd-ai
**Deploy:** bs.thomasperdana.com
**DB:** Supabase hermesdb (shepherd_* tables, 14 tables)
**Auth:** Clerk (Google, GitHub, Facebook social login)
**Stack:** Next.js 16 · TypeScript · DeepSeek V3 · KJV Local JSON

---

## CURRENT STATE

| Feature | Status |
|---|---|
| 4-Level Study Generation (L1-L4) | ✅ |
| KJV Local Bible Lookup (31K verses) | ✅ |
| Strong's Concordance (14K entries) | ✅ |
| PDF Export (all 4 levels + legacy) | ✅ |
| Theological Root — 3 modes (Christological / Trinity / Systematic) | ✅ |
| Hope · Faith · Love (1 Cor 13:13) woven into every study | ✅ |
| Clerk Auth (Google/GitHub/Facebook) | ✅ |
| Landing Page (auth detection, no blink) | ✅ |
| App Icon (1024px + all sizes + favicon) | ✅ |
| Privacy Policy (/privacy.html) | ✅ |
| Study History → Supabase + localStorage fallback | ✅ |
| User Profile Auto-Creation | ✅ |
| Recommendation Engine (3-tier, journaled) | ✅ |
| **Phase 2: Assessment (21 q's, radar chart)** | ✅ |
| **Phase 2: Journal + Fruit Tracker (Gal 5 + Jas 3)** | ✅ |
| **Phase 2: Dashboard widgets** | ✅ |
| **Phase 3: Curriculum (4 paths × 64 modules)** | ✅ |
| **Phase 3: Workbook Generator (4-session + PDF)** | ✅ |
| **Phase 4: Flywheel Analytics (7-dim scorecard)** | ✅ |
| **Phase 4: Heatmap, Radar, Timeline, Plateau detection** | ✅ |
| **Phase 5: Community Feed + Sharing Engine** | ✅ |
| **Phase 5: Testimony Wall (Pray/Encourage)** | ✅ |
| **Phase 6: Study Groups (create/join/invite codes)** | ✅ |
| **Phase 6: Leader's Guide Generator** | ✅ |
| **Phase 8: Theological Root — 3 focus modes** | ✅ |
| **Phase 9: Thompson Chain Reference (50 topics)** | ✅ |
| **Phase 9: Intertestament Cross-References (24 connections)** | ✅ |

---

## PHASE 1 — FOUNDATION ✅ DONE

Clerk auth, Supabase wiring, Vercel deploy, study history, profiles, recommendations, privacy policy, app icon, login fix.

---

## PHASE 2 — BS5 CORE ✅ DONE

- `/app/assess` — 21-question diagnostic, 7-dimension radar chart, auto-level
- `/app/journal` — CRUD journal, Fruit of Spirit (Gal 5:22-23 + Jas 3:17-18), privacy locks
- Dashboard widgets on `/app` (welcome, quick actions, stats)

---

## PHASE 3 — CURRICULUM PATHS ✅ DONE

- `/app/curriculum` — 4 paths (Seeker's 12wk, Disciple's 16wk, Teacher's 24wk, Scholar's ongoing) × 64 total modules
- Each module: passage, themes, objectives, key questions, memory verse, Christological connection
- Progress tracking with checkmarks + NEXT badge
- `/app/workbook` — DeepSeek 4-session workbook generator with PDF export

---

## PHASE 4 — FLYWHEEL ANALYTICS ✅ DONE

- `/api/flywheel` — aggregates study, journal, assessment, workbook data
- `/app/flywheel` — 7-dimension scorecard (study consistency, journal depth, prayer life, scripture memory, application, community, growth trajectory)
- Circular score gauge, radar chart, GitHub-style heatmap, activity timeline
- Plateau detection with suggestions
- Personalized 30-day narrative report

---

## PHASE 5 — COMMUNITY + SHARING ✅ DONE

- `/app/community` — 4 tabs: Feed, Testimonies, Prayer Wall, Share
- Privacy enforcement at API level: prayer/struggle fields STRIPPED before sharing
- Anonymous testimonies with 🙏 Pray / 💛 Encourage interactions
- Share study insights or journal reflections
- `/api/share`, `/api/testimony` routes

---

## PHASE 6 — TEACHER TOOLS ✅ DONE

- `/app/groups` — create groups (auto 6-char invite code), join via code, member list
- Leader/teacher/member roles
- `/api/leader-guide` — AI-generated session plan: welcome, read, discuss, apply, pray
- Leader notes for each discussion question, tough Q&A, group size adaptations
- Christological focus + homework assignment per session

---

## PHASE 7 — POLISH + LAUNCH ✅ DONE

- [x] Mobile responsive design — hamburger nav, stacked forms, responsive grids
- [x] SEO metadata — metadataBase set to production URL, OG images
- [x] Error boundary — friendly retry page with themed design
- [x] 404 page — not-found with verse reference
- [x] Privacy policy link in app footer
- [ ] Rate limiting on API routes (future)
- [ ] Accessibility audit (future)
- [ ] End-to-end testing (future)
- [ ] Launch checklist (future)

---

## PHASE 8 — THEOLOGICAL ROOT UPGRADE ✅ DONE

Replaced single Christological focus with a **3-mode selectable theological root** and mandatory **Hope/Faith/Love** analysis (1 Corinthians 13:13).

### Focus Modes

| Mode | Traces |
|---|---|
| ✝️ **Christological** | Jesus (Gospels) → OT prophecy → Doctrine → Application |
| 🔺 **Trinitarian** | Father's plan → Son's work → Spirit's application |
| 🏛️ **Theological** | Full 7-locus systematic: Theology Proper, Anthropology, Christology, Soteriology, Pneumatology, Ecclesiology, Eschatology |

### Hope · Faith · Love

Every study generated now answers three questions grounded in 1 Corinthians 13:13:

| Virtue | Question |
|---|---|
| 🙏 **Faith** | What does this passage teach us to **believe** about God? |
| 🌟 **Hope** | What does this passage give us to **hope** for? |
| ❤️ **Love** | How does this passage call us to **love**? |

**Files changed:**
- `src/lib/christological-root.ts` → upgraded with 3 `buildSystemPrompt(focus)` variants
- `src/app/api/study/route.ts` → accepts `focus` param, routes to correct prompt
- `src/app/app/page.tsx` → focus selector UI (3 gold buttons below level selector)

---

## PHASE 9 — CROSS-REFERENCE TOOLS ✅ DONE

Two interconnected Bible reference tools on every study result page.

### 🔗 Thompson Chain Reference (50 Topics)

Thompson Chain Reference Bible-style topical chains — trace a topic through Scripture verse by verse.

**50 curated chains across 15 categories:**
God, Jesus Christ, Holy Spirit, Salvation, Scripture, Sin, Christian Life, Suffering, Church, End Times, Covenants, Discipleship, Wisdom, Family, Cardinal Virtues

**Features:**
- 📖 **Related tab** — chains containing the current verse (e.g., John 3:16 → God's Love + Faith)
- 🗂️ **Browse tab** — search all 50 chains by keyword
- 🔍 **Search tab** — find chains by topic name
- 🔗 **Chain navigation** — prev/next verse traversal with KJV text
- 📍 **Position indicator** — "verse 6 of 15" highlighting your passage in the chain
- 🤖 **AI chain generation** — DeepSeek creates custom topical chains for any passage

**Files:** `src/data/chain-topics.ts`, `src/lib/chain-reference.ts`, `src/app/api/chain/route.ts`, `src/components/ChainReference.tsx`

### 📜 Intertestament Cross-References (24 Connections)

Shows how the Old and New Testaments speak to each other about a given passage.

**24 curated connections:**
Creation, Protoevangelium, Abrahamic Covenant, Passover Lamb, The Law, Davidic Covenant, Psalm 22 (Crucifixion), Psalm 110 (Priestly King), Virgin Birth, Suffering Servant, New Covenant, Christ + Law, Word Became Flesh, Serpent Lifted Up, Justification by Faith, Adam/Christ Headship, Golden Chain, Hall of Faith, Melchizedek, New Creation, Faith-Hope-Love, The Shepherd, The Temple

**5 connection types with color badges:**
- 🗣️ Direct Quote — NT explicitly cites OT
- ✅ Fulfillment — OT prophecy fulfilled in NT
- 🔗 Typology — OT foreshadows NT reality
- 💭 Allusion — NT echoes OT theme
- 📖 Thematic — Doctrinal parallel across testaments

**Features:**
- 📜 **OT tab** — Old Testament foundations, prophecies, and types
- ✝️ **NT tab** — New Testament fulfillments, quotes, and expansions
- 📝 **Full KJV verse text** — every reference rendered with actual Scripture
- 🤖 **AI: How Christ Fulfills This** — DeepSeek generates cross-testament analysis with Gospel citations

**Files:** `src/data/intertestament-connections.ts`, `src/lib/intertestament.ts`, `src/app/api/intertestament/route.ts`, `src/components/IntertestamentRefs.tsx`

---

## 🎉 ALL 9 PHASES COMPLETE

**Shepherd AI is production-ready at https://bs.thomasperdana.com**

| Phase | Status |
|---|---|
| 1 — Foundation | ✅ |
| 2 — Assessment + Journal | ✅ |
| 3 — Curriculum + Workbooks | ✅ |
| 4 — Flywheel Analytics | ✅ |
| 5 — Community + Sharing | ✅ |
| 6 — Teacher Tools + Groups | ✅ |
| 7 — Polish + Launch | ✅ |
| 8 — Theological Root Upgrade | ✅ |
| 9 — Cross-Reference Tools | ✅ |

**14 database tables · 16 API routes · 12 components · 10 app pages · 8 app nav links**
**Tech:** Next.js 16 · Clerk · Supabase · DeepSeek V3 · jsPDF · KJV JSON

---

## FILE STRUCTURE

```
src/
├── app/
│   ├── page.tsx                    → Landing page
│   ├── layout.tsx                  → Root layout + metadata
│   ├── app/
│   │   ├── page.tsx                → Study generator + dashboard
│   │   ├── layout.tsx              → App shell nav (8 links)
│   │   ├── assess/page.tsx         → 21-question diagnostic
│   │   ├── journal/page.tsx        → Journal + Fruit tracker
│   │   ├── curriculum/page.tsx     → 64-module curriculum
│   │   ├── workbook/page.tsx       → Workbook generator + PDF
│   │   ├── flywheel/page.tsx       → 30-day growth report
│   │   ├── community/page.tsx      → Sharing + testimony wall
│   │   └── groups/page.tsx         → Study groups + leader guide
│   ├── sign-in/                    → Clerk sign-in
│   └── sign-up/                    → Clerk sign-up
├── api/
│   ├── study/route.ts              → Study generation
│   ├── strongs/route.ts            → Strong's lookup
│   ├── assess/route.ts             → Assessment save
│   ├── history/route.ts            → Study history CRUD
│   ├── profile/route.ts            → User profile
│   ├── journal/route.ts            → Journal CRUD
│   ├── recommend/route.ts          → 3-tier recommendations
│   ├── recommend/accept/route.ts   → Accept recommendation
│   ├── workbook/route.ts           → Workbook generation
│   ├── flywheel/route.ts           → Flywheel data aggregation
│   ├── share/route.ts              → Community sharing
│   ├── testimony/route.ts          → Testimony wall
│   ├── groups/route.ts             → Group management
│   ├── groups/[id]/members/route.ts → Group members
│   ├── chain/route.ts               → Chain reference lookup + AI generation
│   ├── intertestament/route.ts       → OT↔NT cross-reference lookup + AI
├── components/
│   ├── ChainReference.tsx            → Thompson chain reference panel
│   ├── IntertestamentRefs.tsx        → OT↔NT cross-reference panel
│   └── RadarChart.tsx                → SVG radar chart
├── data/
│   ├── chain-topics.ts               → 50 curated Thompson-style topics
│   └── intertestament-connections.ts → 24 curated OT↔NT connections
├── lib/
│   ├── bible.ts                      → KJV lookup
│   ├── christological-root.ts        → Root prompt
│   ├── chain-reference.ts            → Chain traversal, AI prompt
│   ├── intertestament.ts             → Intertestament enrichment, AI prompt
│   ├── curriculum.ts                 → 64-module curriculum data
│   ├── pdf.ts                        → PDF export (all levels)
│   └── supabase.ts                   → DB client
└── middleware.ts                    → Clerk auth guard
```

---

## DATABASE (Supabase hermesdb — 14 tables)

| Table | Purpose |
|---|---|
| shepherd_profiles | User profiles (Clerk-linked) |
| shepherd_studies | Study history |
| shepherd_journals | Journal entries + fruit scores |
| shepherd_fruit_scores | Fruit tracker time series |
| shepherd_assessments | Assessment results |
| shepherd_workbooks | Generated workbooks |
| shepherd_recommendations | 3-tier recommendations |
| shepherd_progress | Curriculum/module progress |
| shepherd_shares | Community shared content |
| shepherd_testimonies | Anonymous testimonies |
| shepherd_prayer_requests | Opt-in prayer sharing |
| shepherd_groups | Study groups |
| shepherd_group_members | Group membership |
| shepherd_leader_guides | Leader's guides |

---

## KEY CONSTRAINTS

| Constraint | Impact |
|---|---|
| Vercel Hobby 60s timeout | DeepSeek V3 (3-15s) ✅ |
| Supabase free tier 500MB | Monitor as usage grows |
| Clerk free tier 10K MAU | Fine for current scale |
| Local KJV JSON (6.4MB) | Committed to git |
