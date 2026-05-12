# 10 Study Types × 4 Levels (40 Combinations) — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add 10 specialized Bible study methodologies, each available at all 4 levels (5th Grade → PhD), producing 40 unique output schemas.

**Architecture:** A declarative study-type registry (`study-types.ts`) defines each study type with 4 level-specific JSON schemas and prompt instructions. The API route loads the registry, composes the prompt from study type + level + focus, and returns structured JSON. The frontend uses a parameterized renderer that maps study type sections to Card components.

**Tech Stack:** TypeScript, Next.js 16 (API routes), DeepSeek V3 via OpenRouter, React (client components).

---

## Phase 1: Study Type Registry (Backend Foundation)

### Task 1: Create study type registry file

**Objective:** Define the declarative config that drives all 40 combinations.

**Files:**
- Create: `src/lib/study-types.ts`

**Code:** Full file — 10 study types, each with 4 level schemas + prompt instructions.

```typescript
// ═══════════════════════════════════════════════════════════════════
// Study Type Registry — 10 methodologies × 4 levels = 40 schemas
// ═══════════════════════════════════════════════════════════════════

export type StudyTypeId =
  | "exegetical"
  | "thematic"
  | "character"
  | "chapter_outline"
  | "historical_context"
  | "prophetic"
  | "apologetic"
  | "devotional"
  | "covenant"
  | "wisdom";

export interface StudyTypeConfig {
  id: StudyTypeId;
  label: string;
  emoji: string;
  description: string;
  bestFor: string;
  /** Level-specific schemas and prompt instructions */
  levels: Record<number, StudyTypeLevel>;
}

export interface StudyTypeLevel {
  /** JSON schema fields — what the AI must output */
  schema: Record<string, SchemaField>;
  /** Prompt instructions that tell the AI how to fill this schema at this level */
  promptInstructions: string;
}

export interface SchemaField {
  type: "string" | "string[]" | "object" | "object[]";
  description: string;
  /** For object arrays, describe each item's shape */
  items?: Record<string, { type: string; description: string }>;
}

export const STUDY_TYPES: Record<StudyTypeId, StudyTypeConfig> = {
  // ── 1. EXEGETICAL ──────────────────────────────────────────
  exegetical: {
    id: "exegetical",
    label: "Exegetical Deep Dive",
    emoji: "🔍",
    description: "Word-by-word original language analysis",
    bestFor: "Dissecting a specific verse or short passage",
    levels: {
      1: {
        schema: {
          passage_reference: { type: "string", description: "Verse reference" },
          passage_text: { type: "string", description: "Full KJV text" },
          what_it_says: { type: "string", description: "Simple paraphrase in kid's own words, max 2 sentences" },
          special_word: { type: "object", description: "One key word explained simply", items: { word: { type: "string", description: "The word" }, what_it_means: { type: "string", description: "Simple definition" }, hand_motion: { type: "string", description: "A gesture to remember it" } } },
          god_is_like: { type: "string", description: "What this verse tells us God is like" },
          draw_this: { type: "string", description: "A drawing prompt a child can do" },
          talk_to_god: { type: "string", description: "2-3 sentence prayer a child can pray" },
        },
        promptInstructions: `LEVEL 1 EXEGETICAL: Explain ONE verse to a 10-year-old. Pick the single most important word and make it fun — use a hand motion, a sound effect, or a silly comparison. No Greek/Hebrew words. No abstract theology. Make God tangible.`,
      },
      2: {
        schema: {
          passage_reference: { type: "string", description: "Verse reference" },
          passage_text: { type: "string", description: "Full KJV text" },
          the_situation: { type: "string", description: "What was happening when this was written? 2-3 sentences a teen cares about." },
          the_words: { type: "object[]", description: "2-3 key words explained", items: { word: { type: "string", description: "The word in English" }, original: { type: "string", description: "Greek/Hebrew transliteration + Strong's" }, real_meaning: { type: "string", description: "What it really meant in the original (no Sunday School answer)" } } },
          so_what: { type: "string", description: "One paragraph — why this matters to a teenager's actual life right now" },
          the_clash: { type: "string", description: "How this truth conflicts with what culture/social media says" },
          try_it: { type: "string", description: "One concrete thing to do this week" },
        },
        promptInstructions: `LEVEL 2 EXEGETICAL: Explain to a 14-18 year old. Show them the original language matters — not because it's academic, but because the English sometimes hides what's actually there. Address identity, pressure, anxiety, or purpose. No clichés.`,
      },
      3: {
        schema: {
          passage_reference: { type: "string", description: "Verse reference" },
          passage_text: { type: "string", description: "Full KJV text" },
          context: { type: "object", description: "Historical and literary context", items: { historical: { type: "string", description: "Historical background" }, literary: { type: "string", description: "Where this fits in the book's argument" }, authorial_intent: { type: "string", description: "What the writer was trying to accomplish" } } },
          word_studies: { type: "object[]", description: "3-4 key Greek/Hebrew words", items: { word: { type: "string", description: "Transliterated original" }, strongs: { type: "string", description: "Strong's number" }, etymology: { type: "string", description: "Root meaning" }, why_kjv_choice: { type: "string", description: "Why the 1611 translators chose this English word" } } },
          cross_references: { type: "object[]", description: "3-5 scriptural cross-references", items: { ref: { type: "string", description: "Reference" }, connection: { type: "string", description: "How this illuminates the passage" } } },
          theological_synthesis: { type: "string", description: "Core doctrine taught here" },
          application: { type: "string", description: "Practical, actionable application for a believer" },
        },
        promptInstructions: `LEVEL 3 EXEGETICAL: College-level exegetical analysis. Use the Historical-Grammatical method. Identify 3-4 key Greek/Hebrew words with Strong's numbers. Explain etymologies and why the KJV translators chose their renderings. Provide 3-5 intertextual cross-references using Scripture-interpreting-Scripture.`,
      },
      4: {
        schema: {
          passage_reference: { type: "string", description: "Verse reference" },
          passage_text: { type: "string", description: "Full KJV text" },
          exegetical_analysis: { type: "object[]", description: "Per-verse analysis", items: { verse: { type: "string", description: "Verse text" }, greek_or_hebrew: { type: "string", description: "Original language text or transliteration" }, parsing: { type: "string", description: "Full parsing: tense, voice, mood, person, number, gender, case" }, syntax: { type: "string", description: "Syntactical observations" }, textual_variants: { type: "string", description: "Significant manuscript variants" }, lxx_background: { type: "string", description: "Septuagint background if OT citation" } } },
          philological_deep_dive: { type: "object", description: "Deep analysis of one key word", items: { word: { type: "string", description: "Original language word" }, etymology: { type: "string", description: "Full etymology" }, cognates: { type: "string", description: "Related words in cognate languages" }, diachronic: { type: "string", description: "Diachronic semantic development" }, synchronic: { type: "string", description: "Synchronic usage in same corpus" }, tdnt_nidntte: { type: "string", description: "Key insights from TDNT/NIDNTTE/TLOT" } } },
          intertextual_map: { type: "object[]", description: "Cross-references with analysis", items: { ref: { type: "string", description: "Reference" }, relationship: { type: "string", description: "Type: quotation, allusion, echo, thematic" }, exegetical_significance: { type: "string", description: "What this connection proves exegetically" } } },
          scholarly_debate: { type: "object[]", description: "Major scholarly positions", items: { position: { type: "string", description: "Named position" }, scholar: { type: "string", description: "Scholar + work" }, argument: { type: "string", description: "Core argument" }, presuppositions: { type: "string", description: "Methodological assumptions" } } },
          reformed_position: { type: "string", description: "Most defensible position from confessional Reformed perspective" },
          sermon_prep: { type: "object", description: "Sermon preparation", items: { homiletical_big_idea: { type: "string", description: "One-sentence sermon thesis" }, outline: { type: "string", description: "Full outline: intro, points, illustrations, conclusion" }, tough_questions: { type: "string[]", description: "Top 3 objections and exegetical answers" } } },
        },
        promptInstructions: `LEVEL 4 EXEGETICAL: PhD-level exegetical analysis. Full historical-grammatical method. Parse every significant verb. Discuss textual variants. Engage the LXX for OT citations. Include philological deep dive with diachronic/synchronic analysis citing TDNT/NIDNTTE/TLOT. Map intertextual connections by type. Engage named scholars. Provide sermon prep.`,
      },
    },
  },

  // ── 2. THEMATIC ──────────────────────────────────────────
  thematic: {
    id: "thematic",
    label: "Thematic / Topical",
    emoji: "🧵",
    description: "Track a doctrine through the whole Bible",
    bestFor: "Studying a concept like grace, faith, or covenant",
    levels: {
      1: {
        schema: {
          topic: { type: "string", description: "The big idea we're learning about" },
          first_time: { type: "string", description: "Where does the Bible first talk about this? Simple explanation." },
          jesus_and_this: { type: "string", description: "What did Jesus say or do about this topic?" },
          picture_this: { type: "string", description: "A visual metaphor a kid understands" },
          my_turn: { type: "string", description: "One way to live this out today" },
          talk_to_god: { type: "string", description: "2-3 sentence prayer" },
        },
        promptInstructions: `LEVEL 1 THEMATIC: Trace a big Bible idea for a 10-year-old. Use the "First Mention" idea simply: "The first time the Bible talks about X..." Connect everything to Jesus. Give one concrete action.`,
      },
      2: {
        schema: {
          topic: { type: "string", description: "The theme/topic" },
          where_it_started: { type: "string", description: "First mention in Scripture + what it established" },
          how_it_grew: { type: "string", description: "How the idea develops from OT shadows to NT reality" },
          defining_verses: { type: "object[]", description: "3 top verses that define this", items: { ref: { type: "string", description: "Reference" }, text: { type: "string", description: "KJV text" }, why_key: { type: "string", description: "Why this verse is critical" } } },
          the_real_definition: { type: "string", description: "Clear definition a teenager can own" },
          what_everyone_gets_wrong: { type: "string", description: "Common misconception" },
        },
        promptInstructions: `LEVEL 2 THEMATIC: Trace a doctrine for a high schooler. Use First Mention. Show OT→NT progression. Give defining verses. Address what culture gets wrong about this.`,
      },
      3: {
        schema: {
          topic: { type: "string", description: "The theme/topic" },
          first_mention: { type: "object", description: "First Mention analysis", items: { passage: { type: "string", description: "Reference" }, precedent_set: { type: "string", description: "How the initial context sets the precedent" } } },
          progressive_revelation: { type: "object", description: "OT to NT development", items: { ot_foundation: { type: "string", description: "Types, shadows, prophecies" }, nt_fulfillment: { type: "string", description: "Christological fulfillment" } } },
          defining_verses: { type: "object[]", description: "Top 5 most critical verses", items: { ref: { type: "string", description: "Reference" }, text: { type: "string", description: "KJV text" }, analysis: { type: "string", description: "Analysis of precise English phrasing" } } },
          synthesized_doctrine: { type: "string", description: "Clear theological definition strictly from the KJV text" },
          common_misconceptions: { type: "string[]", description: "Modern misunderstandings addressed" },
        },
        promptInstructions: `LEVEL 3 THEMATIC: Systematic theology topical study. Apply the Law of First Mention. Trace progressive revelation from OT types/shadows to NT Christological fulfillment. Provide 5 defining KJV verses with phrasing analysis. Synthesize a theological definition. Address misconceptions.`,
      },
      4: {
        schema: {
          topic: { type: "string", description: "The theme/topic" },
          first_mention_exegesis: { type: "object", description: "Full First Mention analysis", items: { passage: { type: "string", description: "Reference" }, full_text: { type: "string", description: "KJV text" }, semantic_precedent: { type: "string", description: "What the Hebrew/Greek term established" }, canonical_trajectory: { type: "string", description: "How subsequent authors built on this foundation" } } },
          progressive_revelation_map: { type: "object[]", description: "OT → NT development stages", items: { era: { type: "string", description: "Patriarchal/Mosaic/Prophetic/Apostolic" }, development: { type: "string", description: "How understanding advanced" }, key_texts: { type: "string[]", description: "Key passages from this era" } } },
          concordance_map: { type: "object[]", description: "Major occurrences mapped", items: { ref: { type: "string", description: "Reference" }, original_word: { type: "string", description: "Greek/Hebrew + Strong's" }, semantic_nuance: { type: "string", description: "Specific nuance in this context" }, theological_contribution: { type: "string", description: "What this occurrence adds to the doctrine" } } },
          confessional_formulation: { type: "string", description: "How the Reformed confessions articulate this doctrine" },
          systematic_loci: { type: "object[]", description: "Connections to systematic theology loci", items: { locus: { type: "string", description: "Which loci" }, connection: { type: "string", description: "How this doctrine connects" } } },
          annotated_bibliography: { type: "object[]", description: "Key scholarly works", items: { source: { type: "string", description: "Author, title" }, contribution: { type: "string", description: "Unique contribution to this doctrine" }, limitation: { type: "string", description: "Where it falls short" } } },
          research_questions: { type: "string[]", description: "Unresolved questions for further research" },
        },
        promptInstructions: `LEVEL 4 THEMATIC: PhD-level systematic theology. Full First Mention exegesis with Hebrew/Greek analysis. Map progressive revelation across canonical eras. Build a concordance map with semantic nuance at each occurrence. Connect to confessional formulations and systematic loci. Provide annotated bibliography. Generate research questions.`,
      },
    },
  },

  // ── 3. CHARACTER ──────────────────────────────────────────
  character: {
    id: "character",
    label: "Character & Typology",
    emoji: "👤",
    description: "Study a biblical figure, find Christ foreshadowed",
    bestFor: "Joseph, David, Melchizedek, Esther, Moses",
    levels: {
      1: {
        schema: {
          name: { type: "string", description: "The person's name" },
          their_story: { type: "string", description: "Their story in 3-4 simple sentences" },
          hero_or_not: { type: "string", description: "What they did right and what they did wrong" },
          like_jesus: { type: "string", description: "One way this person reminds us of Jesus" },
          be_like_them: { type: "string", description: "One thing to copy from their life" },
          talk_to_god: { type: "string", description: "2-3 sentence prayer" },
        },
        promptInstructions: `LEVEL 1 CHARACTER: Tell a kid about a Bible person. Keep the story simple. Show one way they're like Jesus. Give one thing to copy.`,
      },
      2: {
        schema: {
          name: { type: "string", description: "The person's name" },
          origin_story: { type: "string", description: "Where they came from, their big moments — told like a movie trailer, 3-4 sentences" },
          the_real_them: { type: "object", description: "Honest look at their life", items: { strengths: { type: "string[]", description: "What they did right (with verses)" }, failures: { type: "string[]", description: "Where they blew it (with verses)" } } },
          jesus_connection: { type: "string", description: "The coolest way this person points to Jesus — specific parallel" },
          your_life: { type: "string", description: "What a teenager should take from this — one honest paragraph" },
        },
        promptInstructions: `LEVEL 2 CHARACTER: Bible character for a teenager. Show their real struggles — successes AND screw-ups. Find the Jesus connection without being cheesy. Give one takeaway that actually matters to a 16-year-old's life.`,
      },
      3: {
        schema: {
          name: { type: "string", description: "The person's name" },
          biographical_arc: { type: "object", description: "Major life events timeline", items: { timeline: { type: "string[]", description: "Chronological major events" }, covenants: { type: "string[]", description: "Any covenants God made with them" } } },
          spiritual_autopsy: { type: "object", description: "Objective analysis", items: { righteous_acts: { type: "string[]", description: "Acts of faith with KJV citations" }, moral_failures: { type: "string[]", description: "Failures with KJV citations" } } },
          christological_typology: { type: "object[]", description: "How they foreshadow Christ", items: { parallel: { type: "string", description: "Specific parallel (e.g., betrayal, exaltation, office)" }, ot_event: { type: "string", description: "OT event with reference" }, nt_fulfillment: { type: "string", description: "Gospel fulfillment with reference" } } },
          spiritual_exhortation: { type: "string[]", description: "Key leadership/spiritual lessons for a modern believer" },
        },
        promptInstructions: `LEVEL 3 CHARACTER: Biblical typology study. Provide biographical arc with covenant analysis. Do a spiritual autopsy — faith acts AND moral failures, both with KJV citations. Detail Christological typology with direct OT→NT parallels. Give spiritual exhortations.`,
      },
      4: {
        schema: {
          name: { type: "string", description: "The person's name" },
          critical_biography: { type: "object", description: "Scholarly biography", items: { sources: { type: "string[]", description: "Biblical sources (all references)" }, extrabiblical: { type: "string", description: "Extrabiblical attestation if any" }, chronological_reconstruction: { type: "string", description: "Reconstructed chronology with scholarly consensus" } } },
          character_exegesis: { type: "object[]", description: "Key episodes analyzed", items: { episode: { type: "string", description: "Narrative episode with reference" }, narrative_function: { type: "string", description: "What role this episode plays in the larger narrative" }, theological_significance: { type: "string", description: "Theological contribution of this episode" }, intertextual_echoes: { type: "string[]", description: "Where this episode is referenced elsewhere" } } },
          typological_hermeneutics: { type: "object", description: "Typology methodology", items: { methodological_framework: { type: "string", description: "Framework: what makes a valid type?" }, parallels: { type: "object[]", description: "Detailed type-antitype pairs", items: { type_element: { type: "string", description: "The typological element" }, ot_manifestation: { type: "string", description: "OT manifestation" }, nt_fulfillment: { type: "string", description: "NT fulfillment in Christ" }, escalation: { type: "string", description: "How Christ exceeds the type" } } }, scholarly_positions: { type: "object[]", description: "Positions on typological validity", items: { scholar: { type: "string", description: "Scholar + work" }, position: { type: "string", description: "Their stance on this typology" }, argument: { type: "string", description: "Their reasoning" } } } } },
          homiletical_use: { type: "object", description: "How to preach this character", items: { christocentric_angle: { type: "string", description: "The Christocentric homiletical angle" }, sermon_series_outline: { type: "string", description: "3-4 sermon series outline" }, difficult_passages: { type: "object[]", description: "Difficult episodes and how to handle them", items: { episode: { type: "string", description: "The difficult episode" }, challenge: { type: "string", description: "The homiletical challenge" }, approach: { type: "string", description: "How to preach it faithfully" } } } } },
        },
        promptInstructions: `LEVEL 4 CHARACTER: PhD-level character and typology study. Reconstruct critical biography with source analysis. Perform character exegesis on each major episode — narrative function, theological significance, intertextual echoes. Develop a typological hermeneutics framework. Engage named scholars on typological validity. Provide homiletical strategy including difficult passage approaches.`,
      },
    },
  },

  // ── 4. CHAPTER OUTLINE ──────────────────────────────────────────
  chapter_outline: {
    id: "chapter_outline",
    label: "Chapter Outline",
    emoji: "📋",
    description: "Structural breakdown of a full chapter",
    bestFor: "Understanding authorial intent and flow of argument",
    levels: {
      1: {
        schema: {
          chapter: { type: "string", description: "Chapter reference" },
          chapter_text_snippet: { type: "string", description: "First few verses" },
          the_big_picture: { type: "string", description: "What this whole chapter is about in one sentence" },
          first_part: { type: "string", description: "What happens in the beginning + what verses" },
          middle_part: { type: "string", description: "What happens in the middle + what verses" },
          last_part: { type: "string", description: "What happens at the end + what verses" },
          the_best_verse: { type: "object", description: "The most important verse", items: { verse: { type: "string", description: "The verse" }, why: { type: "string", description: "Why it's the most important" } } },
          do_this: { type: "string", description: "One thing to do because of this chapter" },
        },
        promptInstructions: `LEVEL 1 CHAPTER OUTLINE: Break a chapter into 3 simple parts for a 10-year-old. Beginning, middle, end. Pick the best verse. Give one action item.`,
      },
      2: {
        schema: {
          chapter: { type: "string", description: "Chapter reference" },
          the_argument: { type: "string", description: "The chapter's main argument in one punchy sentence" },
          structure: { type: "object[]", description: "Sections of the chapter", items: { section: { type: "string", description: "Section name" }, verses: { type: "string", description: "Verse range" }, what_happens: { type: "string", description: "What happens here" }, why_matters: { type: "string", description: "Why this section matters to the argument" } } },
          the_aha_moment: { type: "string", description: "The verse that changes everything" },
          your_move: { type: "string", description: "What to do differently this week" },
        },
        promptInstructions: `LEVEL 2 CHAPTER OUTLINE: Break a chapter for a teenager. Make the argument clear and punchy. Divide into logical sections. Find the verse that changes everything. Give one concrete move.`,
      },
      3: {
        schema: {
          chapter: { type: "string", description: "Chapter reference" },
          core_thesis: { type: "string", description: "One-sentence summary of the chapter's overarching argument" },
          homiletical_outline: { type: "object[]", description: "Detailed, logically divided outline", items: { section_title: { type: "string", description: "Alliterated or structured section title" }, verses: { type: "string", description: "Verse range" }, content_summary: { type: "string", description: "What the section contains" }, homiletical_point: { type: "string", description: "The preaching point from this section" } } },
          pivotal_conjunctions: { type: "object[]", description: "Key transitional words", items: { word: { type: "string", description: "The conjunction (e.g., 'Wherefore', 'But God')" }, before: { type: "string", description: "What came before" }, after: { type: "string", description: "What comes after" }, significance: { type: "string", description: "How this transition shifts the argument" } } },
          application_bridge: { type: "string", description: "How this chapter moves from doctrine to obedience" },
        },
        promptInstructions: `LEVEL 3 CHAPTER OUTLINE: Expository structural analysis in the vein of Spurgeon or G. Campbell Morgan. Provide a core thesis. Build a homiletical outline with alliterated sections. Highlight pivotal KJV conjunctions ('Wherefore', 'But God', 'Therefore') and explain the before/after. Bridge from doctrinal instruction to active obedience.`,
      },
      4: {
        schema: {
          chapter: { type: "string", description: "Chapter reference" },
          rhetorical_analysis: { type: "object", description: "Rhetorical structure", items: { genre: { type: "string", description: "Literary genre" }, rhetorical_strategy: { type: "string", description: "What persuasive strategy the author employs" }, discourse_structure: { type: "object[]", description: "Discourse-level breakdown", items: { unit: { type: "string", description: "Discourse unit label" }, verses: { type: "string", description: "Verse range" }, function: { type: "string", description: "Rhetorical function" }, grammatical_signals: { type: "string[]", description: "Grammatical signals marking transitions" } } } } },
          intertextual_architecture: { type: "object[]", description: "OT quotations, allusions, echoes", items: { source: { type: "string", description: "OT source" }, type: { type: "string", description: "Quotation/allusion/echo" }, function: { type: "string", description: "Rhetorical/theological function in context" } } },
          confessional_intersections: { type: "object[]", description: "Where this chapter touches confessional loci", items: { locus: { type: "string", description: "Theological locus" }, verses: { type: "string", description: "Relevant verses" }, contribution: { type: "string", description: "Contribution to the doctrine" } } },
          homiletical_strategies: { type: "object[]", description: "Multiple preaching approaches", items: { approach: { type: "string", description: "Named approach (expository, thematic, redemptive-historical, etc.)" }, big_idea: { type: "string", description: "The big idea from this angle" }, outline: { type: "string", description: "Sermon outline" }, strength: { type: "string", description: "What this approach highlights" }, weakness: { type: "string", description: "What it might miss" } } },
          scholarly_commentary: { type: "object[]", description: "Key commentaries on this chapter", items: { commentator: { type: "string", description: "Author + work" }, key_insight: { type: "string", description: "Unique contribution" }, debated_point: { type: "string", description: "Where they disagree with others" } } },
        },
        promptInstructions: `LEVEL 4 CHAPTER OUTLINE: PhD-level structural and rhetorical analysis. Identify genre and rhetorical strategy. Break down discourse structure with grammatical signals. Map intertextual architecture (quotations, allusions, echoes by type). Connect to confessional loci. Provide multiple homiletical strategies with strengths/weaknesses. Engage scholarly commentaries.`,
      },
    },
  },

  // ── 5. HISTORICAL CONTEXT ──────────────────────────────────────────
  historical_context: {
    id: "historical_context",
    label: "Historical Context",
    emoji: "🏺",
    description: "Ancient cultural, political, geographical background",
    bestFor: "Understanding what the original audience heard",
    levels: {
      1: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          where_it_happened: { type: "string", description: "Where in the world this took place" },
          what_life_was_like: { type: "string", description: "What daily life was like for these people — food, clothes, houses, jobs" },
          picture_this: { type: "string", description: "Imagine you're there — describe what you see, hear, smell" },
          why_this_matters: { type: "string", description: "Why knowing this helps us understand the story better" },
        },
        promptInstructions: `LEVEL 1 HISTORICAL CONTEXT: Paint a picture of the ancient world for a 10-year-old. Where did this happen? What was daily life like? Make them feel like they're there — sights, sounds, smells. Show why this makes the Bible story cooler.`,
      },
      2: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          the_world_then: { type: "string", description: "What was happening in the world when this was written — politics, wars, empires" },
          social_rules: { type: "object[]", description: "Cultural norms modern readers miss", items: { norm: { type: "string", description: "The cultural rule" }, why_surprising: { type: "string", description: "Why it would surprise us today" }, how_it_changes_meaning: { type: "string", description: "How knowing this changes how we read the passage" } } },
          the_awkward_parts: { type: "string", description: "Parts of this passage that seem weird today — explained by historical context" },
        },
        promptInstructions: `LEVEL 2 HISTORICAL CONTEXT: For a teenager, show what was happening in the world. Call out cultural norms that modern readers totally miss. Explain the "awkward parts" of the text through historical context. Make it feel like insider knowledge.`,
      },
      3: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          geographical_significance: { type: "string", description: "Why the location matters in this narrative" },
          cultural_norms: { type: "object[]", description: "Ancient customs, idioms, societal rules", items: { norm: { type: "string", description: "The norm or custom" }, modern_parallel: { type: "string", description: "Closest modern equivalent" }, exegetical_impact: { type: "string", description: "How this changes or deepens understanding" } } },
          political_religious_climate: { type: "string", description: "How ruling powers and religious sects influence the events" },
          illuminated_meaning: { type: "string", description: "How historical context deepens the primary theological message" },
        },
        promptInstructions: `LEVEL 3 HISTORICAL CONTEXT: Act as a biblical archaeologist and historian. Explain geographical significance. Identify cultural norms, idioms, and societal rules with modern parallels. Analyze political and religious climate (Pharisees, Sadducees, Romans, etc.). Show how historical context illuminates theological meaning.`,
      },
      4: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          archaeological_context: { type: "object", description: "Archaeological evidence", items: { relevant_sites: { type: "string[]", description: "Relevant archaeological sites" }, material_culture: { type: "string", description: "Material culture: pottery, architecture, inscriptions" }, textual_evidence: { type: "string[]", description: "Extrabiblical textual evidence from the period" }, scholarly_consensus: { type: "string", description: "Scholarly consensus on dating and provenance" } } },
          sociopolitical_analysis: { type: "object[]", description: "Deep sociopolitical analysis", items: { power_structure: { type: "string", description: "Relevant power structures" }, economic_factors: { type: "string", description: "Economic realities affecting the narrative" }, religious_institutions: { type: "string", description: "Religious institutions and their influence" }, social_stratification: { type: "string", description: "How social class affects the dynamics" } } },
          cultural_hermeneutics: { type: "object[]", description: "Cultural elements requiring hermeneutical bridge", items: { element: { type: "string", description: "Cultural element" }, ancient_significance: { type: "string", description: "What it meant then" }, hermeneutical_challenge: { type: "string", description: "Challenge for modern application" }, faithful_bridge: { type: "string", description: "How to faithfully apply today" } } },
          reception_history: { type: "object[]", description: "How the passage has been understood across eras", items: { era: { type: "string", description: "Patristic/Medieval/Reformation/Modern" }, interpretation: { type: "string", description: "Dominant interpretation" }, key_figure: { type: "string", description: "Key figure who advanced this reading" } } },
          annotated_bibliography: { type: "object[]", description: "Key scholarly works on the historical context", items: { source: { type: "string", description: "Author, title" }, focus: { type: "string", description: "Specific contribution" } } },
        },
        promptInstructions: `LEVEL 4 HISTORICAL CONTEXT: PhD-level historical-critical analysis. Present archaeological evidence with scholarly consensus. Perform sociopolitical analysis — power structures, economics, religious institutions, social stratification. Develop cultural hermeneutics bridges. Trace reception history across eras. Provide annotated bibliography.`,
      },
    },
  },

  // ── 6. PROPHETIC ──────────────────────────────────────────
  prophetic: {
    id: "prophetic",
    label: "Prophetic & Eschatology",
    emoji: "🔮",
    description: "Analyze prophecy, covenants, and end times",
    bestFor: "Daniel, Revelation, prophetic OT passages",
    levels: {
      1: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          god_makes_a_promise: { type: "string", description: "What God promised in this passage" },
          did_it_happen: { type: "string", description: "Did this promise already come true, or is it for later?" },
          what_it_means_for_us: { type: "string", description: "What this promise means for us today" },
          picture_this: { type: "string", description: "Draw a picture of what this promise looks like" },
        },
        promptInstructions: `LEVEL 1 PROPHETIC: For a 10-year-old. Frame it as "God makes a promise." Did it already happen or is it for later? Keep the weird symbols simple. Focus on what it means for us today.`,
      },
      2: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          the_prediction: { type: "string", description: "What was predicted — plain English" },
          then_vs_later: { type: "object", description: "Then vs. later", items: { already_happened: { type: "string", description: "What already happened (if anything)" }, still_coming: { type: "string", description: "What's still future" } } },
          symbol_decoder: { type: "object[]", description: "Key symbols decoded", items: { symbol: { type: "string", description: "The weird image or symbol" }, meaning: { type: "string", description: "What it actually means" } } },
          dont_freak_out: { type: "string", description: "Why a teenager shouldn't freak out about this" },
        },
        promptInstructions: `LEVEL 2 PROPHETIC: Decode prophecy for a teenager. Distinguish what already happened from what's still coming. Decode the weird symbols. Address end-times anxiety — why they shouldn't freak out.`,
      },
      3: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          fulfillment: { type: "object", description: "Immediate vs ultimate fulfillment", items: { immediate: { type: "string", description: "Near-term historical fulfillment (if any)" }, ultimate: { type: "string", description: "Eschatological fulfillment" }, prophetic_telescope: { type: "string", description: "Explain the 'prophetic telescope' effect if applicable" } } },
          symbolism: { type: "object[]", description: "Decoded symbols with scriptural cross-references", items: { symbol: { type: "string", description: "Apocalyptic/prophetic symbol" }, cross_ref: { type: "string", description: "Where else this symbol appears" }, meaning: { type: "string", description: "Decoded meaning" } } },
          covenantal_framework: { type: "string", description: "How this prophecy fits into God's overarching covenants" },
          eschatological_views: { type: "object[]", description: "Major eschatological interpretations", items: { framework: { type: "string", description: "Premillennial/Amillennial/Postmillennial" }, interpretation: { type: "string", description: "How this framework interprets the passage" } } },
        },
        promptInstructions: `LEVEL 3 PROPHETIC: Analyze prophecy and eschatology. Distinguish immediate from ultimate fulfillment. Explain the prophetic telescope. Decode symbols by cross-referencing Scripture (e.g., how Daniel informs Revelation). Place within covenantal framework. Summarize Premil/Amil/Postmil interpretations.`,
      },
      4: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          genre_analysis: { type: "object", description: "Prophetic genre classification", items: { subgenre: { type: "string", description: "Apocalyptic/prose prophecy/oracle/vision report" }, formal_features: { type: "string[]", description: "Formal features identifying the subgenre" }, hermeneutical_implications: { type: "string", description: "How genre should shape interpretation" } } },
          fulfillment_matrix: { type: "object[]", description: "Fulfillment analysis", items: { element: { type: "string", description: "Prophetic element" }, preterist_reading: { type: "string", description: "Preterist interpretation" }, futurist_reading: { type: "string", description: "Futurist interpretation" }, idealist_reading: { type: "string", description: "Idealist interpretation" }, reformed_assessment: { type: "string", description: "Which is most faithful to Reformed hermeneutics" } } },
          apocalyptic_grammar: { type: "object[]", description: "Apocalyptic grammar decoded", items: { feature: { type: "string", description: "Apocalyptic feature (numbers, colors, creatures, cosmic imagery)" }, ot_background: { type: "string", description: "OT background" }, nt_usage: { type: "string", description: "NT usage" }, interpretive_range: { type: "string", description: "Range of scholarly interpretations" } } },
          covenantal_architecture: { type: "object", description: "Covenant framework", items: { covenants_in_view: { type: "string[]", description: "Which covenants are in view" }, relationship: { type: "string", description: "How they relate to each other in this passage" }, fulfillment_in_christ: { type: "string", description: "How Christ fulfills these covenant promises" } } },
          scholarly_positions: { type: "object[]", description: "Major scholarly eschatological positions", items: { scholar: { type: "string", description: "Scholar + school" }, framework: { type: "string", description: "Their eschatological framework" }, key_argument: { type: "string", description: "Their key argument on this passage" }, critique: { type: "string", description: "Scholarly critique of their position" } } },
          pastoral_implications: { type: "object", description: "Pastoral handling of prophecy", items: { avoid: { type: "string[]", description: "Pastoral pitfalls to avoid" }, emphasize: { type: "string[]", description: "What to emphasize instead" } } },
        },
        promptInstructions: `LEVEL 4 PROPHETIC: PhD-level prophetic and eschatological analysis. Classify prophetic genre and hermeneutical implications. Build fulfillment matrix: preterist/futurist/idealist with Reformed assessment. Decode apocalyptic grammar with OT background. Map covenantal architecture. Engage scholarly positions with critique. Provide pastoral handling guidance.`,
      },
    },
  },

  // ── 7. APOLOGETIC ──────────────────────────────────────────
  apologetic: {
    id: "apologetic",
    label: "Apologetic Defense",
    emoji: "🛡️",
    description: "Defend doctrine, resolve apparent contradictions",
    bestFor: "James 2:24 vs Romans 3:28, hard questions, skeptics",
    levels: {
      1: {
        schema: {
          the_question: { type: "string", description: "The hard question someone might ask" },
          short_answer: { type: "string", description: "The simple answer in one sentence" },
          how_we_know: { type: "string", description: "How we know this is true — simple evidence" },
          what_to_say: { type: "string", description: "What to tell a friend who asks about this" },
        },
        promptInstructions: `LEVEL 1 APOLOGETIC: Answer a hard Bible question for a 10-year-old. Give a simple answer. Show simple evidence. Teach them what to say to a friend.`,
      },
      2: {
        schema: {
          the_objection: { type: "string", description: "The common objection or apparent contradiction" },
          seems_weird_because: { type: "string", description: "Why this seems like a problem at first" },
          actually: { type: "string", description: "The real explanation — plain English" },
          the_bigger_picture: { type: "string", description: "How this connects to the bigger story of the Bible" },
          comeback: { type: "string", description: "A short, smart response a teen can use" },
        },
        promptInstructions: `LEVEL 2 APOLOGETIC: Address a Bible difficulty for a teenager. Name the objection honestly. Explain why it seems like a contradiction. Show how it actually fits. Give them a "comeback" — a short smart response they can actually use.`,
      },
      3: {
        schema: {
          the_objection: { type: "string", description: "Clearly stated apparent contradiction or difficulty" },
          harmonization: { type: "object", description: "How the text reconciles", items: { grammatical_analysis: { type: "string", description: "KJV grammatical analysis" }, contextual_analysis: { type: "string", description: "Surrounding context" }, scriptural_harmony: { type: "string", description: "How it aligns with the rest of Scripture" } } },
          original_language_clarification: { type: "string", description: "If the objection stems from English misunderstanding, clarify the underlying Hebrew/Greek" },
          apologetic_talking_point: { type: "string", description: "Concise, persuasive talking point for a believer to use with skeptics" },
        },
        promptInstructions: `LEVEL 3 APOLOGETIC: Master apologist and KJV textual defender. State the apparent contradiction clearly. Reconcile using grammatical analysis, context, and Scripture-interpreting-Scripture. If the issue is translational, clarify the original Hebrew/Greek. Provide a persuasive talking point.`,
      },
      4: {
        schema: {
          the_objection: { type: "string", description: "The objection stated in its strongest form" },
          critical_history: { type: "object", description: "History of the objection", items: { origin: { type: "string", description: "Who first raised this objection and when" }, development: { type: "string", description: "How the objection developed over time" }, major_proponents: { type: "string[]", description: "Major scholars/skeptics who have advanced it" } } },
          exegetical_resolution: { type: "object[]", description: "Full exegetical resolution", items: { level: { type: "string", description: "Textual/Grammatical/Contextual/Theological" }, analysis: { type: "string", description: "Detailed analysis" }, supporting_scholarship: { type: "string", description: "Scholarly support" } } },
          original_language_deep_dive: { type: "object", description: "Original language resolution", items: { hebrew_or_greek: { type: "string", description: "Relevant original language text" }, parsing_notes: { type: "string", description: "Parsing notes" }, semantic_analysis: { type: "string", description: "Semantic analysis resolving the tension" }, comparative_usage: { type: "string[]", description: "Comparative usage in other passages" } } },
          philosophical_framework: { type: "object", description: "Underlying philosophical issues", items: { epistemic_issues: { type: "string", description: "Epistemological assumptions behind the objection" }, worldview_clash: { type: "string", description: "How differing worldviews produce the tension" }, reformed_response: { type: "string", description: "Reformed philosophical response" } } },
          apologetic_strategies: { type: "object[]", description: "Multiple apologetic approaches", items: { approach: { type: "string", description: "Classical/Evidential/Presuppositional/etc." }, argument: { type: "string", description: "The argument from this approach" }, audience: { type: "string", description: "Best audience for this approach" } } },
        },
        promptInstructions: `LEVEL 4 APOLOGETIC: PhD-level apologetic defense. State the objection in its strongest form. Trace its critical history — origin, development, major proponents. Provide multi-level exegetical resolution (textual, grammatical, contextual, theological). Perform original language deep dive with parsing and comparative usage. Address philosophical/epistemic issues. Offer multiple apologetic strategies (classical, evidential, presuppositional).`,
      },
    },
  },

  // ── 8. DEVOTIONAL ──────────────────────────────────────────
  devotional: {
    id: "devotional",
    label: "Devotional / Lectio Divina",
    emoji: "🕯️",
    description: "Prayerful, heart-level meditation on a passage",
    bestFor: "Psalm 23, John 15, personal spiritual growth",
    levels: {
      1: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          passage_text: { type: "string", description: "Full KJV text" },
          special_word: { type: "string", description: "The most special word in this passage" },
          what_it_means: { type: "string", description: "What this special word means" },
          god_loves_you: { type: "string", description: "How this passage shows God loves you" },
          quiet_time_idea: { type: "string", description: "Something quiet to do while thinking about this verse" },
          prayer: { type: "string", description: "A 2-3 sentence prayer" },
        },
        promptInstructions: `LEVEL 1 DEVOTIONAL: For a 10-year-old's quiet time. Pick one special word. Show God's love. Give a quiet activity (draw, sit still, look at nature). Short prayer.`,
      },
      2: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          passage_text: { type: "string", description: "Full KJV text" },
          read: { type: "string", description: "The word or phrase that jumps out — and what it literally means" },
          think: { type: "string", description: "What God is saying through this word — personal, honest, not preachy" },
          pray: { type: "string", description: "A 3-4 sentence guided prayer from the passage" },
          live: { type: "string", description: "One mental or physical habit to practice today" },
        },
        promptInstructions: `LEVEL 2 DEVOTIONAL: Lectio Divina adapted for a teenager. Make it personal and honest — not churchy. Pick the striking word/phrase. Show what God is saying. Write a prayer they'd actually pray. Give one habit.`,
      },
      3: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          passage_text: { type: "string", description: "Full KJV text" },
          lectio: { type: "object", description: "Read", items: { striking_phrase: { type: "string", description: "Most striking KJV word or phrase" }, literal_meaning: { type: "string", description: "Literal meaning" } } },
          meditatio: { type: "object", description: "Meditate", items: { what_god_is_saying: { type: "string", description: "What God is saying to the believer's heart" }, worldly_contrast: { type: "string", description: "Contrast with worldly anxiety or striving" } } },
          oratio: { type: "string", description: "3-4 sentence guided prayer from the vocabulary and promises of the passage" },
          contemplatio: { type: "string", description: "One specific, actionable mental or physical habit to practice today" },
        },
        promptInstructions: `LEVEL 3 DEVOTIONAL: Spiritual director and pastoral counselor. Guide through Lectio Divina. Highlight striking KJV phrasing. Contrast biblical perspective with worldly anxiety. Provide guided prayer. Give one actionable habit.`,
      },
      4: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          passage_text: { type: "string", description: "Full KJV text" },
          lectio: { type: "object", description: "Careful reading", items: { primary_phrase: { type: "string", description: "Primary striking phrase" }, kjv_phrasing_analysis: { type: "string", description: "Why the KJV translators chose these specific English words" }, original_language_nuance: { type: "string", description: "Hebrew/Greek nuance the English partially captures" } } },
          meditatio: { type: "object", description: "Deep meditation", items: { theological_meaning: { type: "string", description: "Theological significance" }, personal_application: { type: "string", description: "Personal, soul-level application" }, cultural_critique: { type: "string", description: "How this counters a specific cultural idol" }, christ_connection: { type: "string", description: "How this points to Christ" } } },
          oratio: { type: "object", description: "Prayer", items: { adoration: { type: "string", description: "Adoration based on the passage" }, confession: { type: "string", description: "Confession prompted by the passage" }, thanksgiving: { type: "string", description: "Thanksgiving from the passage" }, supplication: { type: "string", description: "Supplication flowing from the passage" } } },
          contemplatio: { type: "object", description: "Contemplation", items: { mental_habit: { type: "string", description: "Mental discipline to cultivate" }, physical_practice: { type: "string", description: "Physical practice to embody" }, communal_dimension: { type: "string", description: "How to share this with others" } } },
          historical_devotional_voices: { type: "object[]", description: "Historical devotional insights", items: { figure: { type: "string", description: "Historical figure (e.g., Spurgeon, Augustine, Teresa of Avila)" }, insight: { type: "string", description: "Their insight on this passage" } } },
        },
        promptInstructions: `LEVEL 4 DEVOTIONAL: PhD-level devotional meditation. Full Lectio Divina with ACTS prayer structure (Adoration, Confession, Thanksgiving, Supplication). Analyze KJV phrasing choices. Connect to Christ. Critique cultural idols. Engage historical devotional voices. Include communal dimension.`,
      },
    },
  },

  // ── 9. COVENANT ──────────────────────────────────────────
  covenant: {
    id: "covenant",
    label: "Covenant Theology",
    emoji: "📜",
    description: "Trace God's covenants through redemptive history",
    bestFor: "Jeremiah 31, Galatians 3, Hebrews 8-10",
    levels: {
      1: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          gods_promise: { type: "string", description: "What special promise God is making" },
          handshake_with_god: { type: "string", description: "Explain a covenant like a special handshake — God makes a promise and asks us to trust Him" },
          jesus_keeps_the_promise: { type: "string", description: "How Jesus makes this promise come true" },
          my_part: { type: "string", description: "What's my part? Trust, obey, or both?" },
        },
        promptInstructions: `LEVEL 1 COVENANT: For a 10-year-old. Frame God's covenant as a "special promise" or "handshake with God." Show how Jesus makes it come true. Give one simple thing for them to do.`,
      },
      2: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          the_deal: { type: "string", description: "What deal/agreement is God making here?" },
          old_rules_new_rules: { type: "object", description: "Old vs new", items: { what_stayed_same: { type: "string", description: "What stayed the same from OT to NT" }, what_changed: { type: "string", description: "What changed" } } },
          grace_kicker: { type: "string", description: "The part that shows it's about grace, not just rules" },
          why_freedom: { type: "string", description: "Why this means freedom, not more religious rules" },
        },
        promptInstructions: `LEVEL 2 COVENANT: For a teenager. Explain the "deal" God is making. Show what stayed the same and what changed. Highlight the grace part — this isn't about more rules. Show why this means freedom.`,
      },
      3: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          covenant_identification: { type: "string", description: "Which specific covenant is in view (Adamic, Noahic, Abrahamic, Mosaic, Davidic, New)" },
          continuity_discontinuity: { type: "object", description: "What continues and what changes", items: { continuity: { type: "string[]", description: "Things that remain the same between OT and NT" }, discontinuity: { type: "string[]", description: "Things that change" } } },
          law_grace_dynamic: { type: "string", description: "How the passage navigates the tension between Law (requirements) and Grace (provision)" },
          christ_fulfillment: { type: "string", description: "How Jesus Christ fulfills the requirements or promises of this covenant" },
        },
        promptInstructions: `LEVEL 3 COVENANT: Biblical theologian specializing in Covenant Theology. Identify which covenant is in view. Analyze continuity vs. discontinuity between OT and NT. Navigate the Law/Grace dynamic. Show precisely how Christ fulfills the covenant requirements or promises.`,
      },
      4: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          covenant_taxonomy: { type: "object", description: "Covenant classification", items: { covenant: { type: "string", description: "Which covenant" }, parties: { type: "string", description: "Parties to the covenant" }, stipulations: { type: "string[]", description: "Stipulations" }, sanctions: { type: "string[]", description: "Sanctions (blessings/curses)" }, suzerain_vassal_structure: { type: "string", description: "Suzerain-vassal treaty structure analysis" } } },
          federal_headship: { type: "object", description: "Federal headship analysis", items: { adam_role: { type: "string", description: "Adam's role as federal head" }, christ_role: { type: "string", description: "Christ's role as second Adam" }, implications: { type: "string", description: "Implications for imputation and representation" } } },
          covenant_theology_debates: { type: "object[]", description: "Major covenant theology debates", items: { debate: { type: "string", description: "The debate (e.g., Republication, monocovenantalism)" }, positions: { type: "string[]", description: "Positions with key proponents" }, reformed_consensus: { type: "string", description: "Reformed confessional consensus" } } },
          new_covenant_hermeneutics: { type: "object", description: "New Covenant hermeneutics", items: { jeremiah_31_quotation: { type: "string", description: "How NT authors use Jeremiah 31" }, already_not_yet: { type: "string", description: "Already/not yet tension" }, sacramental_implications: { type: "string", description: "Implications for baptism and Lord's Supper" } } },
          redemptive_historical_flow: { type: "object[]", description: "Where this fits in redemptive history", items: { covenant_era: { type: "string", description: "Covenant era" }, role_in_story: { type: "string", description: "This covenant's role in the story" }, supersession: { type: "string", description: "How the next covenant supersedes or fulfills it" } } },
        },
        promptInstructions: `LEVEL 4 COVENANT: PhD-level covenant theology. Perform covenant taxonomy with suzerain-vassal structure analysis. Analyze federal headship (Adam/Christ). Engage major covenant theology debates (Republication, monocovenantalism). Develop New Covenant hermeneutics (already/not yet, sacramental implications). Map redemptive-historical flow across covenant eras.`,
      },
    },
  },

  // ── 10. WISDOM ──────────────────────────────────────────
  wisdom: {
    id: "wisdom",
    label: "Wisdom Literature",
    emoji: "📖",
    description: "Analyze Proverbs, Ecclesiastes, Job, Song of Solomon",
    bestFor: "Understanding Hebrew poetry and ancient wisdom",
    levels: {
      1: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          the_smart_choice: { type: "string", description: "What's the smart choice this passage is teaching?" },
          the_foolish_choice: { type: "string", description: "What's the foolish choice?" },
          picture_this: { type: "string", description: "A story or picture that shows the difference" },
          try_this_today: { type: "string", description: "One thing to try today — make the smart choice" },
        },
        promptInstructions: `LEVEL 1 WISDOM: For a 10-year-old. Show the smart choice vs. the foolish choice. Give a story or picture that makes the difference clear. One thing to try today.`,
      },
      2: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          the_wisdom: { type: "string", description: "The core wisdom in one sentence" },
          smart_path: { type: "object", description: "The smart path", items: { what_it_looks_like: { type: "string", description: "What this looks like in real life" }, real_example: { type: "string", description: "A real scenario a teenager faces" } } },
          foolish_path: { type: "object", description: "The foolish path", items: { what_it_looks_like: { type: "string", description: "What this looks like" }, where_it_leads: { type: "string", description: "Where this path ends up" } } },
          choice_point: { type: "string", description: "The specific moment today where this choice matters" },
        },
        promptInstructions: `LEVEL 2 WISDOM: For a teenager. Contrast the two paths with real scenarios they face. Show where each path leads. Identify a specific choice point today.`,
      },
      3: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          poetic_structure: { type: "object", description: "Hebrew poetic structure", items: { parallelism_type: { type: "string", description: "Synonymous/antithetical/synthetic parallelism" }, structural_impact: { type: "string", description: "How the structure enhances the KJV translation meaning" } } },
          two_paths: { type: "object", description: "Wisdom vs. folly contrast", items: { wisdom_path: { type: "string", description: "The path of wisdom as presented" }, folly_path: { type: "string", description: "The path of folly as presented" } } },
          cultural_metaphors: { type: "object[]", description: "Ancient metaphors explained", items: { metaphor: { type: "string", description: "The metaphor used" }, ancient_meaning: { type: "string", description: "What it meant in ancient agrarian/financial/cultural context" }, modern_equivalent: { type: "string", description: "Modern equivalent" } } },
          modern_application: { type: "string", description: "Core principle translated into a practical 21st-century scenario (career, marriage, finances)" },
        },
        promptInstructions: `LEVEL 3 WISDOM: Master of Biblical Wisdom literature. Identify Hebrew parallelism type and structural impact. Contrast wisdom vs. folly paths. Explain ancient metaphors with modern equivalents. Translate core principle into a concrete 21st-century scenario.`,
      },
      4: {
        schema: {
          passage: { type: "string", description: "Passage reference" },
          genre_classification: { type: "object", description: "Wisdom genre classification", items: { subgenre: { type: "string", description: "Proverbial/speculative/lyrical/didactic" }, formal_features: { type: "string[]", description: "Formal features" }, ancient_near_eastern_parallels: { type: "string[]", description: "ANE parallels (Egyptian Instruction, Mesopotamian wisdom)" }, distinctive_israelite_features: { type: "string[]", description: "What makes Israelite wisdom distinctive" } } },
          poetic_analysis: { type: "object[]", description: "Detailed poetic analysis", items: { feature: { type: "string", description: "Poetic feature" }, hebrew_text: { type: "string", description: "Relevant Hebrew (transliterated)" }, function: { type: "string", description: "Poetic function" }, translation_challenge: { type: "string", description: "KJV translation challenge" } } },
          wisdom_christology: { type: "object", description: "Christ as Wisdom", items: { christ_as_wisdom_personified: { type: "string", description: "How Christ fulfills the wisdom tradition" }, proverbs_8_connection: { type: "string", description: "Connection to Proverbs 8 and NT Christology" }, new_testament_wisdom_christology: { type: "string[]", description: "NT passages presenting Christ as God's Wisdom" } } },
          theodicy_and_order: { type: "object", description: "Theodicy and cosmic order", items: { retribution_principle: { type: "string", description: "Retribution principle in this passage" }, job_ecclesiastes_critique: { type: "string", description: "How Job/Ecclesiastes critiques simplistic retribution" }, new_creation_resolution: { type: "string", description: "How new creation resolves the tension" } } },
          practical_theology: { type: "object", description: "From ancient wisdom to modern practice", items: { unchanging_principle: { type: "string", description: "The unchanging theological principle" }, cultural_translation: { type: "string", description: "Cultural translation needed" }, modern_application_domains: { type: "string[]", description: "Specific modern domains of application" }, communal_embodiment: { type: "string", description: "How the church embodies this wisdom corporately" } } },
        },
        promptInstructions: `LEVEL 4 WISDOM: PhD-level wisdom literature analysis. Classify subgenre with ANE parallels. Perform detailed Hebrew poetic analysis with transliteration. Develop wisdom Christology — Christ as Wisdom personified. Address theodicy: retribution principle vs. Job/Ecclesiastes critique. Bridge from ancient wisdom to modern practice with communal embodiment.`,
      },
    },
  },
};

// ── Helper: Get study type metadata for UI ──────────────────

export function getStudyTypeMeta(id: StudyTypeId) {
  const st = STUDY_TYPES[id];
  return { id: st.id, label: st.label, emoji: st.emoji, description: st.description, bestFor: st.bestFor };
}

export function getAllStudyTypeMeta() {
  return (Object.keys(STUDY_TYPES) as StudyTypeId[]).map(getStudyTypeMeta);
}

export function getStudyTypeLevel(id: StudyTypeId, level: number) {
  return STUDY_TYPES[id].levels[level] || STUDY_TYPES[id].levels[3];
}
```

**Verification:** Check that `npx tsc --noEmit` passes (TypeScript compiles).

---

### Task 2: Update API route to support study_type

**Objective:** Wire the study type registry into the existing `/api/study` endpoint.

**Files:**
- Modify: `src/app/api/study/route.ts`

**Changes:**

1. Import study types:
```typescript
import { STUDY_TYPES, type StudyTypeId, getStudyTypeLevel } from "@/lib/study-types";
```

2. Add `study_type` to the request interface:
```typescript
interface StudyRequest {
  passage: string;
  level?: number;
  focus?: FocusMode;
  study_type?: StudyTypeId; // NEW
}
```

3. Add validator:
```typescript
function validateStudyType(st: unknown): StudyTypeId | undefined {
  if (typeof st === "string" && st in STUDY_TYPES) return st as StudyTypeId;
  return undefined; // undefined means "use default behavior" (no study type)
}
```

4. Update `buildSystemPrompt()` to accept optional `studyType` and compose the prompt:
```typescript
function buildSystemPrompt(level: number, focus: FocusMode = "christological", studyType?: StudyTypeId): string {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];
  const base = `${buildTheologicalRoot(focus)}

---

You are Shepherd AI, a theologically conservative KJV Bible study assistant.

Your response is for a LEVEL ${level} study — audience: ${cfg.audience}.
Voice: ${cfg.voice}

Core rules (ALL levels):
1. Use ONLY the King James Version for ALL scripture quotations.
2. Maintain doctrinal fidelity to historic Protestant orthodoxy.
3. NEVER speculate beyond what scripture actually says.
4. Scripture references use standard notation (e.g., John 3:16).
5. Return valid JSON only — no markdown fences, no extra text.`;

  // If study type is specified, use THAT schema instead of default level schema
  if (studyType) {
    const st = STUDY_TYPES[studyType];
    const stLevel = st.levels[level] || st.levels[3];
    // Build JSON schema from the field definitions
    const schemaLines = Object.entries(stLevel.schema).map(([key, field]) => {
      if (field.type === "string") return `    "${key}": "string — ${field.description}"`;
      if (field.type === "string[]") return `    "${key}": ["string — ${field.description}"]`;
      if (field.type === "object" && field.items) {
        const itemLines = Object.entries(field.items).map(([ik, iv]) => `        "${ik}": "string — ${iv.description}"`).join(",\n");
        return `    "${key}": {\n${itemLines}\n      }`;
      }
      if (field.type === "object[]" && field.items) {
        const itemLines = Object.entries(field.items).map(([ik, iv]) => `          "${ik}": "string — ${iv.description}"`).join(",\n");
        return `    "${key}": [{\n${itemLines}\n        }]`;
      }
      return `    "${key}": "string — ${field.description}"`;
    }).join(",\n");

    const schemaBlock = `{\n${schemaLines}\n  }`;

    return `${base}

STUDY TYPE: ${st.label} (${st.emoji})
${st.description}

${stLevel.promptInstructions}

OUTPUT JSON SCHEMA:
${schemaBlock}

IMPORTANT: Return ONLY the JSON object. No markdown fences, no explanation text.`;
  }

  // Fall back to default level schemas
  const levelPrompts: Record<number, string> = { /* ... existing ... */ };
  return `${base}\n\n${levelPrompts[level] || levelPrompts[3]}\n\nIMPORTANT: Return ONLY the JSON object. No markdown fences, no explanation text.`;
}
```

5. In the POST handler, extract `study_type`:
```typescript
const studyType = validateStudyType(body.study_type);
```

6. Pass to prompt builder and response:
```typescript
const systemPrompt = buildSystemPrompt(level, focus, studyType);
```

7. Include `study_type` in the response for the frontend:
```typescript
return NextResponse.json({
  success: true,
  reference: result.reference,
  translation: "King James Version (local)",
  level,
  level_name: cfg.name,
  study_type: studyType || undefined, // NEW
  study: studyData,
});
```

**Verification:** `curl -X POST http://localhost:3000/api/study -H "Content-Type: application/json" -d '{"passage":"John 3:16","level":3,"study_type":"exegetical"}'` should return exegetical study schema.

---

### Task 3: Commit Phase 1

```bash
cd /root/shepherd-ai
git add src/lib/study-types.ts src/app/api/study/route.ts
git commit -m "feat: add study type registry with 10 methodologies × 4 levels (40 schemas)"
git push origin main
```

---

## Phase 2: Frontend — Study Type Selector + Renderers

### Task 4: Add study type selector to the app page

**Objective:** Add a row of study type buttons below the level selector.

**Files:**
- Modify: `src/app/app/page.tsx`

**Changes:**

1. Import study type utilities:
```typescript
import { getAllStudyTypeMeta, type StudyTypeId } from "@/lib/study-types";
```

2. Add state:
```typescript
const [studyType, setStudyType] = useState<StudyTypeId | undefined>(undefined);
```

3. Include `study_type` in the fetch body:
```typescript
body: JSON.stringify({ passage: passage.trim(), level, focus, study_type: studyType || undefined }),
```

4. Add study type selector UI (between level and focus rows):
```tsx
{/* Study Type Selection */}
<div className="flex gap-1.5 justify-center flex-wrap mt-2">
  <button type="button" onClick={() => setStudyType(undefined)}
    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium ${
      !studyType ? "bg-[rgba(88,166,255,0.12)] border-[rgba(88,166,255,0.3)] text-[#58a6ff]"
                : "bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
    }`}>
    📖 Standard
  </button>
  {getAllStudyTypeMeta().map(st => (
    <button key={st.id} type="button" onClick={() => setStudyType(st.id)}
      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium ${
        studyType === st.id
          ? "bg-[rgba(212,153,29,0.12)] border-[rgba(212,153,29,0.3)] text-[#d2991d]"
          : "bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
      }`}
      title={st.description}>
      {st.emoji} {st.label}
    </button>
  ))}
</div>
```

5. Show study type badge in results:
```tsx
{study.study_type && (
  <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium bg-[rgba(212,153,29,0.12)] border-[rgba(212,153,29,0.3)] text-[#d2991d]">
    {STUDY_TYPES[study.study_type]?.emoji} {STUDY_TYPES[study.study_type]?.label}
  </span>
)}
```

---

### Task 5: Build universal study type renderer

**Objective:** Instead of 40 separate render components, build ONE parameterized renderer that reads the study type registry and renders any study type at any level.

**Files:**
- Create: `src/components/StudyTypeRenderer.tsx`

**Approach:** Since we can't predict the AI's exact JSON keys for all 40 schemas ahead of time (the AI generates them), use a smart fallback: iterate over the study data object and render each key as a Card. Use the schema definition to determine icons and card colors.

```typescript
"use client";
import { STUDY_TYPES, type StudyTypeId, type SchemaField } from "@/lib/study-types";

function Card({ icon, title, color, children }: { icon: string; title: string; color: string; children: React.ReactNode }) {
  const borders: Record<string, string> = { green: "border-l-[#3fb950]", yellow: "border-l-[#d2991d]", blue: "border-l-[#58a6ff]", purple: "border-l-[#a371f7]" };
  return (
    <div className={`bg-[#161b22] border border-[#30363d] ${borders[color] || borders.blue} border-l-4 rounded-xl p-5`}>
      <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3 flex items-center gap-2">{icon} {title}</h3>
      {children}
    </div>
  );
}

// Icon/color assignment based on schema field position
function fieldMeta(key: string, index: number, total: number) {
  const icons = ["📌", "📖", "🔍", "🧠", "⚡", "🙏", "🎯", "⚠️", "📊", "🔑", "💡", "🛠️"];
  const colors = ["blue", "green", "yellow", "purple"] as const;
  return { icon: icons[index % icons.length], color: colors[index % colors.length] };
}

function renderValue(value: any, depth: number = 0): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-[#484f58] italic">—</span>;
  if (typeof value === "string") {
    return <p className={depth === 0 ? "text-[#c9d1d9] font-medium" : "text-[#8b949e] leading-relaxed whitespace-pre-line"}>{value}</p>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-[#484f58] italic">None</span>;
    if (typeof value[0] === "string") {
      return <ul className="space-y-2">{value.map((item: string, i: number) => (
        <li key={i} className="flex gap-2 text-[#8b949e] text-sm">
          <span className="text-[#58a6ff] font-bold">{i + 1}.</span>
          <span>{item}</span>
        </li>
      ))}</ul>;
    }
    if (typeof value[0] === "object") {
      return <div className="space-y-3">{(value as Record<string,any>[]).map((obj, i) => (
        <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm">
          {Object.entries(obj).map(([k, v]) => (
            <div key={k} className="mb-1.5 last:mb-0">
              <span className="text-[#c9d1d9] font-semibold text-xs">{formatKey(k)}:</span>{" "}
              {renderValue(v, depth + 1)}
            </div>
          ))}
        </div>
      ))}</div>;
    }
    return <span className="text-[#8b949e]">{JSON.stringify(value)}</span>;
  }
  if (typeof value === "object") {
    return <div className="space-y-2 text-sm">{(Object.entries(value) as [string, any][]).map(([k, v]) => (
      <div key={k}>
        <span className="text-[#c9d1d9] font-semibold text-xs">{formatKey(k)}:</span>{" "}
        {renderValue(v, depth + 1)}
      </div>
    ))}</div>;
  }
  return <span className="text-[#8b949e]">{String(value)}</span>;
}

function formatKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function StudyTypeRenderer({ study, studyType, level }: { study: any; studyType: StudyTypeId; level: number }) {
  const config = STUDY_TYPES[studyType];
  const schema = config.levels[level]?.schema || config.levels[3].schema;
  const schemaKeys = Object.keys(schema);

  if (!study || typeof study !== "object") {
    return <p className="text-[#8b949e] text-center py-8">No study data to display.</p>;
  }

  const studyKeys = Object.keys(study).filter(k => !["passage_reference", "passage_text", "level", "level_name"].includes(k));

  return (
    <div className="space-y-4">
      {studyKeys.map((key, idx) => {
        const value = study[key];
        if (value === undefined) return null;
        const meta = fieldMeta(key, idx, studyKeys.length);
        return (
          <Card key={key} icon={meta.icon} title={formatKey(key)} color={meta.color}>
            {renderValue(value)}
          </Card>
        );
      })}
    </div>
  );
}
```

---

### Task 6: Wire renderer into main app page

**Objective:** When a study has a `study_type`, use `StudyTypeRenderer` instead of `LevelResult`.

**Files:**
- Modify: `src/app/app/page.tsx`

**Changes:**

```typescript
import StudyTypeRenderer from "@/components/StudyTypeRenderer";

// In the results section, replace:
// <LevelResult study={study.study} level={study.level || 0} />
// With:

{study.study_type ? (
  <StudyTypeRenderer study={study.study} studyType={study.study_type} level={study.level || 3} />
) : (
  <LevelResult study={study.study} level={study.level || 0} />
)}
```

Update `StudyResponse` interface:
```typescript
interface StudyResponse { 
  success: boolean; 
  reference: string; 
  translation: string; 
  level?: number; 
  level_name?: string; 
  study_type?: StudyTypeId; // NEW
  study: StudyData; 
}
```

---

### Task 7: Build and deploy

```bash
cd /root/shepherd-ai
npm run build
# Fix any TS errors
git add -A
git commit -m "feat: study type selector + universal renderer for 40 schemas"
git push origin main
# Vercel auto-deploys
```

**Verification:** Visit `shepherd-ai-chi.vercel.app/app`, enter "John 3:16", level 3, select "Exegetical Deep Dive", run study. Should get the exegetical schema rendered.

---

### Task 8: Test coverage (manual)

Test at least 3 study types at 2 different levels each:

| Study Type | Level 1 | Level 4 |
|-----------|---------|---------|
| Exegetical | Romans 8:28 L1 | Romans 8:28 L4 |
| Character | David L1 | David L4 |
| Devotional | Psalm 23 L1 | Psalm 23 L4 |

Each should produce a study with the unique schema for that study type × level.

---

## Summary

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| Phase 1: Backend | Tasks 1-3 (registry + route update + commit) | ~15 min |
| Phase 2: Frontend | Tasks 4-7 (selector + renderer + wiring + build) | ~20 min |
| Phase 3: Test | Task 8 (manual verification of 6 combinations) | ~10 min |
| **Total** | **8 tasks** | **~45 min** |
