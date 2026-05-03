import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { CURRICULUM } from "@/lib/curriculum";

// ── Workbook generation with DeepSeek ──────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { moduleId, passage, level } = body;

    // Find module in curriculum
    let modInfo: any = null;
    if (moduleId) {
      for (const path of CURRICULUM) {
        const found = path.modules.find((m) => m.id === moduleId);
        if (found) {
          modInfo = { ...found, pathName: path.name, pathLevel: path.target_level };
          break;
        }
      }
    }

    const targetPassage = passage || modInfo?.passage || body.passage;
    const targetLevel = level || modInfo?.pathLevel || body.level || 2;

    if (!targetPassage) {
      return NextResponse.json({ error: "Passage required" }, { status: 400 });
    }

    // Build the workbook prompt
    const prompt = buildWorkbookPrompt(targetPassage, targetLevel, modInfo);

    // Call DeepSeek
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
      const errText = await aiResponse.text();
      console.error("DeepSeek error:", errText);
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    let workbook;
    try {
      workbook = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw: content.slice(0, 500) }, { status: 502 });
    }

    // Save to Supabase
    const { data: saved, error } = await supabaseAdmin
      .from("shepherd_workbooks")
      .insert({
        user_id: userId,
        passage: targetPassage,
        level: targetLevel,
        title: modInfo?.title || workbook.title || `Workbook: ${targetPassage}`,
        sessions: workbook,
      })
      .select()
      .single();

    if (error) {
      console.error("Workbook save error:", error);
    }

    return NextResponse.json({
      success: true,
      workbook: {
        id: saved?.id,
        passage: targetPassage,
        level: targetLevel,
        title: modInfo?.title || workbook.title || `Workbook: ${targetPassage}`,
        sessions: workbook,
      },
    });
  } catch (err) {
    console.error("Workbook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── List workbooks ─────────────────────────────────────────────

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("shepherd_workbooks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) return NextResponse.json({ error: "Failed to load workbooks" }, { status: 500 });

    return NextResponse.json({ workbooks: data || [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── Prompt builder ──────────────────────────────────────────────

function buildWorkbookPrompt(passage: string, level: number, modInfo: any): string {
  const levelNames: Record<number, string> = {
    1: "5th Grade (age 10-11, simple and concrete)",
    2: "High School (age 14-18, relevant and honest)",
    3: "College (critical thinking, context, debate)",
    4: "PhD (exegesis, scholarship, original contribution)",
  };

  const levelName = levelNames[level] || levelNames[2];

  let contextBlock = "";
  if (modInfo) {
    contextBlock = `
This module is part of the "${modInfo.pathName}" curriculum path.
Module title: "${modInfo.title}"
Module subtitle: "${modInfo.subtitle}"
Themes: ${modInfo.themes.join(", ")}
Objectives: ${modInfo.objectives.join("; ")}
Key questions to address: ${modInfo.key_questions.join("; ")}
Christological connection: ${modInfo.christological_connection}
`;
  }

  return `You are a Reformed Bible teacher creating a multi-session study workbook. Use the King James Version only.

Generate a workbook for ${passage} at the ${levelName} level.
${contextBlock}

Return valid JSON with this exact structure:
{
  "title": "Workbook title",
  "passage": "${passage}",
  "level": ${level},
  "level_name": "${levelName.split(" (")[0]}",
  "introduction": "A 2-3 sentence overview of the passage and what the student will learn across the sessions.",
  "sessions": [
    {
      "session": 1,
      "title": "Session title",
      "focus_verses": "Verse range for this session",
      "opening_prayer": "A brief opening prayer",
      "read": "Instructions for reading the passage",
      "observe": ["3-5 observation questions about the text"],
      "interpret": ["2-3 interpretation questions"],
      "apply": ["2 application questions"],
      "dig_deeper": "Optional deeper study task",
      "memory_verse": "Key verse to memorize",
      "closing_prayer": "Brief closing prayer"
    }
    // Generate exactly 4 sessions covering the full passage
  ],
  "christological_summary": "How this entire passage points to Christ"
}

Rules:
- All Bible text MUST be KJV
- Keep Reformed theology (sovereignty of God, salvation by grace alone through faith alone in Christ alone)
- For level 1: use simple language, concrete examples, and hands-on activities
- For level 2: be real, relevant, and address honest doubts
- For level 3: engage critical thinking, present interpretive options, note theological pitfalls
- For level 4: include Greek/Hebrew, scholarly debate, annotated bibliography
- Every session must connect to Christ
- Return ONLY the JSON object, no markdown fences, no commentary`;
}
