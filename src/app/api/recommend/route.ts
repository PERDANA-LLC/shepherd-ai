import { NextRequest, NextResponse } from "next/server";
import { lookupPassage } from "@/lib/bible";

export const maxDuration = 30;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://openrouter.ai/api/v1";
const DEEPSEEK_MODEL = "deepseek/deepseek-chat";

// ── Types ──────────────────────────────────────────────────────────

interface RecommendRequest {
  passage: string;
  level: number; // 1-4
  context?: "study_complete" | "assessment" | "journal" | "daily";
  recent_passages?: string[];
  focus_dimension?: string; // e.g. "prayer", "application"
}

interface Recommendation {
  tier: "beginner" | "intermediate" | "expert";
  label: string;
  description: string;
  action: string;
  next_passage?: string;
  reason: string;
}

interface RecommendResponse {
  recommendations: Recommendation[];
  context: string;
  generated_at: string;
}

// ── Tier configs ───────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  beginner: { label: "Beginner", emoji: "🌱", color: "green" },
  intermediate: { label: "Intermediate", emoji: "🌿", color: "blue" },
  expert: { label: "Expert", emoji: "🌳", color: "purple" },
};

const LEVEL_CONTEXT: Record<number, string> = {
  1: "5th grader — needs simple, concrete, foundational next steps",
  2: "high schooler — needs personal relevance and real-world application",
  3: "college student — needs critical thinking depth and teaching practice",
  4: "PhD/seminary — needs original research, scholarly debate, publishable work",
};

// ── System prompt ──────────────────────────────────────────────────

function buildPrompt(level: number, passage: string, context: string, recent: string[], focus?: string): string {
  const tierInfo = Object.entries(TIER_CONFIG)
    .map(([k, v]) => `${v.emoji} ${v.label}: ${k === "beginner" ? "Foundational next step. Safe, achievable, builds confidence." : k === "intermediate" ? "Deeper exploration. Stretches current understanding without overwhelming." : "Advanced/scholarly path. Original contribution, teaching mastery, research."}`)
    .join("\n");

  return `You are a Bible study recommendation engine for Shepherd AI.

A user just completed a ${LEVEL_CONTEXT[level] || "student"} study on "${passage}".
Context: ${context}${focus ? `\nFocus area: ${focus}` : ""}${recent.length ? `\nRecent passages studied: ${recent.join(", ")}` : ""}

Generate EXACTLY 3 recommendations at 3 tiers:

${tierInfo}

Each recommendation must be:
1. Specific — name an actual Bible passage, skill, or action (not generic advice)
2. Contextual — tied to what they just studied
3. Actionable — includes a concrete next step

Return valid JSON only (no markdown fences):
{
  "recommendations": [
    {
      "tier": "beginner",
      "label": "short name (under 40 chars)",
      "description": "1-2 sentences explaining the recommendation",
      "action": "the concrete next step they should take",
      "next_passage": "specific Bible reference or null",
      "reason": "why this recommendation follows from their study"
    },
    {
      "tier": "intermediate",
      ...
    },
    {
      "tier": "expert",
      ...
    }
  ]
}`;
}

// ── Handler ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RecommendRequest;
    const { passage, level = 3, context = "study_complete", recent_passages = [], focus_dimension } = body;

    if (!passage) {
      return NextResponse.json({ error: "passage is required" }, { status: 400 });
    }

    // Look up the passage to verify it exists
    const result = lookupPassage(passage);
    const reference = result.error ? passage : result.reference;

    const prompt = buildPrompt(level, reference, context, recent_passages, focus_dimension);

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
          { role: "system", content: prompt },
          { role: "user", content: `Generate 3-tier recommendations for a Level ${level} student who just studied ${reference}.` },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ error: "AI engine error" }, { status: 502 });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
    }

    // Parse JSON (strip markdown fences if present)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    let data: RecommendResponse;
    try {
      const parsed = JSON.parse(cleanContent);
      data = {
        recommendations: parsed.recommendations || [],
        context,
        generated_at: new Date().toISOString(),
      };
    } catch {
      return NextResponse.json({ error: "Failed to parse recommendations" }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Recommend API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
