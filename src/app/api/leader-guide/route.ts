import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

// ── Generate a leader's guide for group study ───────────────────

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { passage, level, group_name, group_size } = body;

    if (!passage) {
      return NextResponse.json({ error: "Passage required" }, { status: 400 });
    }

    const prompt = buildLeaderGuidePrompt(passage, level || 2, group_name, group_size);

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.DEEPSEEK_MODEL || "deepseek/deepseek-chat";

    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    let guide;
    try {
      guide = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
    }

    // Save to Supabase
    const { data: saved } = await supabaseAdmin
      .from("shepherd_leader_guides")
      .insert({
        user_id: userId,
        passage,
        level: level || 2,
        title: guide.title || `Leader's Guide: ${passage}`,
        guide,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      guide: { id: saved?.id, ...guide },
    });
  } catch (err) {
    console.error("Leader guide error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── List saved guides ──────────────────────────────────────────

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("shepherd_leader_guides")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });

    return NextResponse.json({ guides: data || [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── Prompt ─────────────────────────────────────────────────────

function buildLeaderGuidePrompt(
  passage: string,
  level: number,
  groupName?: string,
  groupSize?: number
): string {
  return `You are a Reformed Bible teacher creating a leader's guide for a small group Bible study. Use the King James Version only.

Create a leader's guide for ${passage} at study level ${level} (${["", "5th Grade", "High School", "College", "PhD"][level] || "College"}).
${groupName ? `This is for the group "${groupName}"` : ""}${groupSize ? ` with approximately ${groupSize} members.` : ""}

Return valid JSON with this structure:
{
  "title": "Leader's Guide: [passage]",
  "passage": "${passage}",
  "overview": "2-3 sentence overview for the leader",
  "prep_notes": "What the leader should study/prepare beforehand",
  "key_passages": ["3-4 related cross-references"],
  "session_flow": {
    "welcome": { "duration": "5 min", "activity": "Icebreaker or opening question" },
    "read": { "duration": "5 min", "activity": "How to read the passage together" },
    "discuss": [
      { "question": "Discussion question 1", "leader_note": "What to listen for / where to steer" },
      { "question": "Discussion question 2", "leader_note": "What to listen for / where to steer" },
      { "question": "Discussion question 3", "leader_note": "What to listen for / where to steer" },
      { "question": "Discussion question 4", "leader_note": "What to listen for / where to steer" }
    ],
    "apply": { "duration": "10 min", "activity": "Application exercise for the group" },
    "pray": { "duration": "5 min", "activity": "Prayer prompts for the group" }
  },
  "tough_questions": [
    { "question": "Likely hard question", "suggested_answer": "How to respond" }
  ],
  "for_smaller_groups": "Adaptation tip for groups of 3-5",
  "for_larger_groups": "Adaptation tip for groups of 8+",
  "homework": "What to assign for next meeting",
  "christological_focus": "How to keep Christ at the center of this study"
}

Rules:
- Use KJV only
- Reformed theology: God's sovereignty, grace alone, faith alone, Christ alone
- Practical leader notes, not just academic commentary
- Help the leader facilitate discussion, not lecture
- Include tips for handling different group dynamics
- Return ONLY the JSON object, no markdown fences`;
}
