import { NextRequest, NextResponse } from "next/server";
import { lookupPassage, versesToText } from "@/lib/bible";
import { buildTheologicalRoot, type FocusMode } from "@/lib/theological-root";
import { STUDY_TYPES, type StudyTypeId, getStudyTypeLevel, buildStudyTypeSchema } from "@/lib/study-types";

// Vercel Hobby plan allows up to 60s for serverless functions
export const maxDuration = 60;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://openrouter.ai/api/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek/deepseek-chat";

// ── Level definitions ──────────────────────────────────────────────

const LEVEL_CONFIG: Record<number, { name: string; audience: string; voice: string }> = {
  1: {
    name: "5th Grader",
    audience: "10-11 year old child",
    voice: "Simple sentences. No theological jargon. Every abstract concept gets a concrete example from school, sports, or family life. How would you explain this at the dinner table to a 10-year-old?",
  },
  2: {
    name: "High Schooler",
    audience: "14-18 year old teenager",
    voice: "Direct, relatable, no Sunday School clichés. Address real teenage struggles — identity, peer pressure, anxiety, purpose. Treat them as young adults who can handle complexity but need it grounded in their actual experience.",
  },
  3: {
    name: "College",
    audience: "undergraduate college student",
    voice: "Academic but accessible. Assume basic biblical literacy, historical context awareness, and willingness to engage multiple viewpoints. Prepare them to teach this material to others. Use Reformed hermeneutics as the interpretive lens.",
  },
  4: {
    name: "PhD",
    audience: "seminary or doctoral-level scholar",
    voice: "Scholarly. Assume seminary-level training in biblical languages, hermeneutics, and systematic theology. The goal is original contribution — the student should leave ready to write, teach, or defend this material at an academic level. Use precise theological terminology. Engage named scholars and academic sources.",
  },
};

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

  // If study type is specified, use its schema instead of default level schema
  if (studyType) {
    const st = STUDY_TYPES[studyType];
    const stLevel = getStudyTypeLevel(studyType, level);
    const schemaBlock = buildStudyTypeSchema(studyType, level);

    return `${base}

STUDY TYPE: ${st.label} (${st.emoji})
${st.description}

${stLevel.promptInstructions}

OUTPUT JSON SCHEMA (return exactly this shape):
${schemaBlock}

IMPORTANT: Return ONLY the JSON object matching this schema. No markdown fences, no explanation text.`;
  }

  const levelPrompts: Record<number, string> = {
    1: `
LEVEL 1 — 5TH GRADER FORMAT:
{
  "passage_reference": "string",
  "passage_text": "string (full KJV text)",
  "level": 1,
  "level_name": "5th Grader",
  "big_idea": "ONE sentence under 15 words — the single most important thing to remember",
  "memory_verse": {
    "verse": "string",
    "text": "string (KJV)",
    "hand_motion": "string (a gesture or rhythm to help memorize)"
  },
  "picture_this": "A visual metaphor a 10-year-old instantly understands. Start with 'It\\'s like when...'",
  "think_about_it": ["2-3 simple questions like 'Have you ever felt...?'"],
  "try_this": "One hands-on activity: draw, act out, tell someone",
  "talk_to_god": "A 2-3 sentence prayer a child can pray themselves",
  "show_someone": "One thing to tell a parent or friend about what you learned"
}`,

    2: `
LEVEL 2 — HIGH SCHOOLER FORMAT:
{
  "passage_reference": "string",
  "passage_text": "string (full KJV text)",
  "level": 2,
  "level_name": "High Schooler",
  "the_hook": "Open with a real scenario a teenager faces today (social media, friendship drama, academic pressure, questioning faith). 2-3 sentences.",
  "the_text": [{"verse": "string", "text": "string (KJV)", "context": "1-2 sentence background"}],
  "what_it_really_means": "One paragraph in plain English. What did this mean then, and what does it mean for a teenager today?",
  "the_clash": "One way this biblical truth conflicts with what culture/social media tells teenagers. Name the tension.",
  "your_turn": ["3-4 personal reflection questions pushing past Sunday School answers"],
  "this_week": "One concrete, measurable challenge for this week",
  "prayer": "A short honest prayer a teenager could actually pray"
}`,

    3: `
LEVEL 3 — COLLEGE FORMAT:
{
  "passage_reference": "string",
  "passage_text": "string (full KJV text)",
  "level": 3,
  "level_name": "College",
  "thesis_statement": "One sentence: the central argument this passage makes. Debatable, defensible, specific.",
  "text_and_context": {
    "historical_background": "What was happening when this was written",
    "literary_context": "Where does this fit in the book's argument",
    "authorial_intent": "What was the writer trying to accomplish"
  },
  "word_study": {
    "word": "string (transliterated Greek/Hebrew)",
    "strongs": "string (e.g. G4102)",
    "definition": "string",
    "semantic_range": "string",
    "other_uses": ["2 other verses with different nuance"]
  },
  "interpretive_options": [
    {
      "view": "string (name this view)",
      "description": "string",
      "strength": "string",
      "weakness": "string"
    }
  ],
  "reformed_view": "Which view is most consistent with Reformed hermeneutics and why",
  "theological_pitfalls": {
    "misunderstanding": "string",
    "consequence": "What happens when a church gets this wrong",
    "corrective_verse": "string"
  },
  "discussion_questions": ["4-5 debate-generating questions for a college small group"],
  "research_assignment": "One task requiring outside work (commentaries, translations, thematic study)",
  "teach_it": "A 3-point outline for teaching this to a high schooler"
}`,

    4: `
LEVEL 4 — PhD FORMAT:
{
  "passage_reference": "string",
  "passage_text": "string (full KJV text)",
  "level": 4,
  "level_name": "PhD",
  "research_question": "Frame as an answerable academic question",
  "exegetical_analysis": [
    {
      "verse": "string",
      "greek_or_hebrew": "string (transliterated if needed)",
      "parsing": "Verb parsing: tense, voice, mood, person, number",
      "syntax": "Syntactical observations",
      "textual_variants": "Any significant manuscript variants",
      "lxx_background": "Septuagint background if OT citation"
    }
  ],
  "philological_deep_dive": {
    "word": "string",
    "etymology": "string",
    "cognates": "Related words in cognate languages",
    "diachronic_development": "How the meaning evolved over time",
    "synchronic_usage": "How it's used in the same corpus",
    "dictionary_entries": "Key insights from TDNT, NIDNTTE, or TLOT"
  },
  "scholarly_debate": [
    {
      "position": "string",
      "scholar": "Name the scholar and work",
      "argument": "string",
      "presuppositions": "Methodological assumptions behind this view"
    }
  ],
  "reformed_position": "Which position is most defensible from confessional Reformed perspective with exegetical warrant",
  "pastoral_note": "If a pastor adopts View A, their congregation will tend toward ___. If View B, toward ___.",
  "annotated_bibliography": [
    {"source": "string (author, title)", "type": "commentary|journal|monograph|historical_theology", "annotation": "1-2 sentence contribution and limitation"}
  ],
  "systematic_theology_connection": {
    "locus": "prolegomena|theology_proper|anthropology|christology|soteriology|pneumatology|ecclesiology|eschatology",
    "explanation": "How this passage supports, nuances, or challenges the confessional formulation"
  },
  "sermon_prep": {
    "titles": ["3 sermon titles with homiletical angle"],
    "outline": "Full sermon outline: intro, points, illustrations, application, conclusion",
    "tough_questions": ["Top 3 objections and exegetical answers"]
  },
  "original_contribution": "What new insight does this study offer?",
  "research_plan": "30-day schedule: reading days, writing days, peer review, revision, delivery requirement"
}`,
  };

  return `${base}

${levelPrompts[level] || levelPrompts[3]}

IMPORTANT: Return ONLY the JSON object. No markdown fences, no explanation text.`;
}

// ── Request / Response types ──────────────────────────────────────

interface StudyRequest {
  passage: string;
  level?: number;
  focus?: FocusMode; // "christological" | "trinitarian" | "theological"
  study_type?: StudyTypeId; // 10 study methodologies (optional — defaults to standard)
}

function validateFocus(focus: unknown): FocusMode {
  if (focus === "trinitarian" || focus === "theological") return focus;
  return "christological"; // default
}

function validateStudyType(st: unknown): StudyTypeId | undefined {
  if (typeof st === "string" && st in STUDY_TYPES) return st as StudyTypeId;
  return undefined; // undefined = use default behavior (no study type)
}

function validateLevel(level: unknown): number {
  if (level === undefined || level === null) return 3; // default: college
  const n = Number(level);
  if (n >= 1 && n <= 4) return n;
  return 3;
}

// ── Handler ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as StudyRequest;
    const { passage } = body;
    const level = validateLevel(body.level);
    const focus = validateFocus(body.focus);
    const studyType = validateStudyType(body.study_type);

    if (!passage || typeof passage !== "string") {
      return NextResponse.json(
        { error: "Please provide a Bible passage reference (e.g., 'John 3:16')." },
        { status: 400 }
      );
    }

    // Step 1: Look up passage from local KJV database
    const result = lookupPassage(passage);

    if (result.error || result.verses.length === 0) {
      return NextResponse.json(
        { error: result.error || `Could not find passage: "${passage}".` },
        { status: 404 }
      );
    }

    const passageText = versesToText(result.verses);
    const cfg = LEVEL_CONFIG[level];

    // Step 2: Build level-specific prompt and send to DeepSeek
    const systemPrompt = buildSystemPrompt(level, focus, studyType);

    const userMessage = `Passage: ${result.reference}
KJV Text:
${passageText}

Generate a Level ${level} (${cfg.name}) Bible study following your system instructions. Return valid JSON only.`;

    const aiResponse = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        ...(DEEPSEEK_BASE_URL.includes("openrouter")
          ? { "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" }
          : {}),
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 6000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("DeepSeek API error:", errorText);
      return NextResponse.json(
        { error: "The AI study engine encountered an error. Please try again." },
        { status: 502 }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("DeepSeek returned empty content.");
      return NextResponse.json(
        { error: "The AI study engine returned an empty response. Try a shorter passage." },
        { status: 502 }
      );
    }

    // Parse JSON — V3 sometimes wraps in ```json fences
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    let studyData;
    try {
      studyData = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse DeepSeek response as JSON. Raw:", content.slice(0, 500));
      studyData = {
        passage_reference: result.reference,
        passage_text: passageText,
        level,
        level_name: cfg.name,
        raw_study: content,
        parse_error: true,
      };
    }

    // Ensure level info is present
    if (!studyData.level) studyData.level = level;
    if (!studyData.level_name) studyData.level_name = cfg.name;

    return NextResponse.json({
      success: true,
      reference: result.reference,
      translation: "King James Version (local)",
      level,
      level_name: cfg.name,
      study_type: studyType || null, // NEW — study methodology used
      study: studyData,
    });
  } catch (error) {
    console.error("Study API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
