import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 7 dimensions × 3 questions each
interface AssessmentResult {
  user_id: string;
  bible_knowledge: number;
  theological_understanding: number;
  hermeneutics: number;
  church_history: number;
  practical_application: number;
  prayer_life: number;
  teaching_ability: number;
  study_level: number;
  teacher_level: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id;
    if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

    // Calculate dimension averages
    const dims = {
      bible_knowledge: avg(body.bible_knowledge ?? []),
      theological_understanding: avg(body.theological_understanding ?? []),
      hermeneutics: avg(body.hermeneutics ?? []),
      church_history: avg(body.church_history ?? []),
      practical_application: avg(body.practical_application ?? []),
      prayer_life: avg(body.prayer_life ?? []),
      teaching_ability: avg(body.teaching_ability ?? []),
    };

    // Overall average determines study level
    const allScores = Object.values(dims).filter((v) => v > 0);
    const overallAvg = allScores.length
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 1;

    const studyLevel = scoreToLevel(overallAvg);
    const teacherLevel = scoreToLevel(
      (dims.teaching_ability + dims.bible_knowledge + dims.hermeneutics) / 3
    );

    // Save to Supabase
    const { data, error } = await supabaseAdmin.from("shepherd_assessments").insert({
      user_id: userId,
      ...dims,
      study_level: studyLevel,
      teacher_level: teacherLevel,
    }).select().single();

    if (error) {
      console.error("Assessment save error:", error);
      return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 });
    }

    // Update profile levels
    await supabaseAdmin
      .from("shepherd_profiles")
      .update({
        study_level: studyLevel,
        teacher_level: teacherLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return NextResponse.json({
      success: true,
      assessment: {
        id: data.id,
        dimensions: dims,
        overall_avg: Math.round(overallAvg * 10) / 10,
        study_level: studyLevel,
        teacher_level: teacherLevel,
        level_name: levelName(studyLevel),
      },
    });
  } catch (err) {
    console.error("Assessment error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function avg(arr: number[]): number {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function scoreToLevel(avg: number): number {
  if (avg <= 1.7) return 1;
  if (avg <= 2.5) return 2;
  if (avg <= 3.5) return 3;
  return 4;
}

function levelName(level: number): string {
  return ["", "5th Grade", "High School", "College", "PhD"][level] || "College";
}
