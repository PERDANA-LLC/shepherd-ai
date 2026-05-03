import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

// ── Flywheel: aggregates all growth data into a scorecard ────────

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
    const todayStr = now.toISOString().split("T")[0];

    // ── 1. Study data ──────────────────────────────────────────
    const { data: studies, error: studyErr } = await supabaseAdmin
      .from("shepherd_studies")
      .select("id, passage, level, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const recentStudies = (studies || []).filter(
      (s) => s.created_at >= thirtyDaysAgo.toISOString()
    );

    // Study streaks
    const studyDates = new Set(
      (studies || []).map((s) => s.created_at.split("T")[0])
    );
    const studyStreak = calcStreak(studyDates, todayStr);
    const studyDays30 = [...studyDates].filter(
      (d) => d >= thirtyDaysAgoStr
    ).length;

    // Level progression
    const levels = (studies || []).map((s) => s.level || 1);
    const avgLevel = levels.length
      ? levels.reduce((a, b) => a + b, 0) / levels.length
      : 1;
    const levelTrend = levels.length >= 2
      ? levels.slice(0, Math.min(5, levels.length)).reduce((a, b) => a + b, 0) /
          Math.min(5, levels.length) -
        levels.slice(-Math.min(5, levels.length)).reduce((a, b) => a + b, 0) /
          Math.min(5, levels.length)
      : 0;

    // ── 2. Journal data ────────────────────────────────────────
    const { data: journals, error: journalErr } = await supabaseAdmin
      .from("shepherd_journals")
      .select("id, entry_date, fruit_scores, gratitude, struggle, prayer_request, content")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false });

    const recentJournals = (journals || []).filter(
      (j) => j.entry_date >= thirtyDaysAgoStr
    );

    const journalDates = new Set(
      (journals || []).map((j) => j.entry_date)
    );
    const journalStreak = calcStreak(journalDates, todayStr);
    const journalDays30 = [...journalDates].filter(
      (d) => d >= thirtyDaysAgoStr
    ).length;

    // Fruit score averages
    let fruitAvg = 0;
    let fruitCount = 0;
    const recentFruitScores: number[] = [];

    for (const j of recentJournals) {
      const scores = j.fruit_scores as Record<string, Record<string, number>> | null;
      if (scores) {
        for (const framework of ["galatians", "james"]) {
          const fw = scores[framework];
          if (fw) {
            const vals = Object.values(fw).filter((v) => typeof v === "number");
            for (const v of vals) {
              fruitAvg += v;
              fruitCount++;
              recentFruitScores.push(v);
            }
          }
        }
      }
    }
    fruitAvg = fruitCount > 0 ? fruitAvg / fruitCount : 0;

    // Prayer entries
    const prayerEntries = recentJournals.filter((j) => j.prayer_request).length;

    // Gratitude entries
    const gratitudeEntries = recentJournals.filter((j) => j.gratitude).length;

    // ── 3. Assessment data ─────────────────────────────────────
    const { data: assessments } = await supabaseAdmin
      .from("shepherd_assessments")
      .select("study_level, teacher_level, created_at, bible_knowledge, theological_understanding, hermeneutics, church_history, practical_application, prayer_life, teaching_ability")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(2);

    const latestAssessment = assessments?.[0] || null;
    const prevAssessment = assessments?.[1] || null;

    // ── 4. Curriculum progress ─────────────────────────────────
    const { data: curriculumProgress } = await supabaseAdmin
      .from("shepherd_progress")
      .select("action, details")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString());

    const curriculumActions = (curriculumProgress || []).length;

    // ── 5. Workbook data ───────────────────────────────────────
    const { data: workbooks } = await supabaseAdmin
      .from("shepherd_workbooks")
      .select("id, created_at")
      .eq("user_id", userId);

    const recentWorkbooks = (workbooks || []).filter(
      (w) => w.created_at >= thirtyDaysAgo.toISOString()
    );

    // ── Scorecard (7 dimensions, 0-100 each) ──────────────────

    const studyScore = Math.min(100, Math.round(
      (studyDays30 / 30) * 60 + (studyStreak >= 3 ? 20 : studyStreak * 6) + (recentStudies.length >= 5 ? 20 : 0)
    ));

    const journalScore = Math.min(100, Math.round(
      (journalDays30 / 30) * 40 + (journalStreak >= 3 ? 20 : 0) + (recentJournals.length >= 7 ? 20 : recentJournals.length * 2) + (fruitAvg >= 3 ? 20 : 0)
    ));

    const prayerScore = Math.min(100, Math.round(
      (prayerEntries / 30) * 50 + (journalStreak >= 5 ? 30 : journalStreak * 6) + (gratitudeEntries >= 5 ? 20 : 0)
    ));

    const memoryScore = Math.min(100, Math.round(
      (curriculumActions / 30) * 60 + (recentWorkbooks.length >= 1 ? 20 : 0) + (studyStreak >= 5 ? 20 : 0)
    ));

    const applicationScore = Math.min(100, Math.round(
      (recentJournals.length / 30) * 40 + (fruitAvg >= 3.5 ? 30 : fruitAvg * 8) + (gratitudeEntries >= 3 ? 30 : 0)
    ));

    const communityScore = 0; // Phase 5 placeholder

    const growthScore = Math.min(100, Math.round(
      (levelTrend > 0 ? 40 : levelTrend > -0.5 ? 20 : 0) +
      (latestAssessment ? 30 : 0) +
      (prevAssessment && latestAssessment &&
        (latestAssessment.study_level || 1) > (prevAssessment.study_level || 1) ? 30 : 0)
    ));

    const overallScore = Math.round(
      (studyScore + journalScore + prayerScore + memoryScore + applicationScore + growthScore) / 6
    );

    // ── Narrative feedback ─────────────────────────────────────
    const narrative = generateNarrative({
      studyScore, journalScore, prayerScore, memoryScore,
      applicationScore, growthScore, overallScore,
      studyStreak, journalStreak, studyDays30, journalDays30,
      fruitAvg, avgLevel, recentStudies: recentStudies.length,
      recentJournals: recentJournals.length, gratitudeEntries,
      hasAssessment: !!latestAssessment,
    });

    // ── Calendar heatmap data ──────────────────────────────────
    const heatmap = buildHeatmap(studies || [], journals || [], thirtyDaysAgoStr, todayStr);

    // ── Timeline ───────────────────────────────────────────────
    const timeline = buildTimeline(studies || [], journals || [], assessments || [], workbooks || []);

    return NextResponse.json({
      scorecard: {
        overall: overallScore,
        dimensions: {
          study_consistency: { score: studyScore, label: "Study Consistency", emoji: "📖" },
          journal_depth: { score: journalScore, label: "Journal Depth", emoji: "📔" },
          prayer_life: { score: prayerScore, label: "Prayer Life", emoji: "🙏" },
          scripture_memory: { score: memoryScore, label: "Scripture Memory", emoji: "🧠" },
          application: { score: applicationScore, label: "Application", emoji: "🛠️" },
          community: { score: communityScore, label: "Community", emoji: "👥" },
          growth_trajectory: { score: growthScore, label: "Growth Trajectory", emoji: "📈" },
        },
      },
      stats: {
        study_streak: studyStreak,
        journal_streak: journalStreak,
        studies_30d: studyDays30,
        journals_30d: journalDays30,
        total_studies: (studies || []).length,
        total_journals: (journals || []).length,
        avg_fruit_score: Math.round(fruitAvg * 10) / 10,
        current_level: Math.round(avgLevel),
        gratitude_entries_30d: gratitudeEntries,
        workbooks_30d: recentWorkbooks.length,
        assessment: latestAssessment
          ? {
              study_level: latestAssessment.study_level,
              teacher_level: latestAssessment.teacher_level,
              date: latestAssessment.created_at,
            }
          : null,
      },
      narrative,
      heatmap,
      timeline,
      plateau: detectPlateau(studies || [], journals || [], assessments || []),
    });
  } catch (err) {
    console.error("Flywheel error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── Helpers ────────────────────────────────────────────────────

function calcStreak(dates: Set<string>, today: string): number {
  let streak = 0;
  let d = new Date(today);
  while (true) {
    const ds = d.toISOString().split("T")[0];
    if (dates.has(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function buildHeatmap(
  studies: any[],
  journals: any[],
  start: string,
  end: string
) {
  const days: Record<string, { studies: number; journals: number; score: number }> = {};

  for (const s of studies) {
    const d = (s.created_at || "").split("T")[0];
    if (d >= start && d <= end) {
      if (!days[d]) days[d] = { studies: 0, journals: 0, score: 0 };
      days[d].studies++;
      days[d].score += 2;
    }
  }

  for (const j of journals) {
    const d = j.entry_date || "";
    if (d >= start && d <= end) {
      if (!days[d]) days[d] = { studies: 0, journals: 0, score: 0 };
      days[d].journals++;
      days[d].score += 3;
    }
  }

  return days;
}

function buildTimeline(
  studies: any[],
  journals: any[],
  assessments: any[],
  workbooks: any[]
) {
  const events: { date: string; type: string; label: string }[] = [];

  for (const s of studies || []) {
    events.push({
      date: (s.created_at || "").split("T")[0],
      type: "study",
      label: `Studied ${s.passage}`,
    });
  }

  for (const j of journals || []) {
    events.push({
      date: j.entry_date || "",
      type: "journal",
      label: "Journal entry",
    });
  }

  for (const a of assessments || []) {
    events.push({
      date: (a.created_at || "").split("T")[0],
      type: "assessment",
      label: `Assessment: Level ${a.study_level}`,
    });
  }

  for (const w of workbooks || []) {
    events.push({
      date: (w.created_at || "").split("T")[0],
      type: "workbook",
      label: "Workbook generated",
    });
  }

  return events
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50);
}

function detectPlateau(studies: any[], journals: any[], assessments: any[]) {
  const studyCount = (studies || []).length;
  const journalCount = (journals || []).length;
  const assessmentCount = (assessments || []).length;

  if (studyCount === 0) return { status: "just_started", message: "You're just getting started! Take your first study to begin tracking growth." };

  if (studyCount < 3) return { status: "early", message: "You're in the early stages. Keep building momentum!" };

  // Check for plateau: lots of studies but no assessments, or studies without journals
  if (studyCount >= 10 && journalCount < 3) {
    return {
      status: "plateau_study_only",
      message: "You're studying consistently but not journaling. Try adding a journal entry after each study to deepen your reflection.",
      suggestion: "journal",
    };
  }

  if (studyCount >= 5 && assessmentCount === 0) {
    return {
      status: "plateau_no_assessment",
      message: "You've been studying but haven't taken an assessment yet. See where you're growing!",
      suggestion: "assessment",
    };
  }

  if (studyCount >= 10 && journalCount >= 5 && assessmentCount >= 1) {
    return {
      status: "growing",
      message: "Great momentum! You're studying, journaling, and tracking growth. Keep it up!",
    };
  }

  return { status: "building", message: "You're building a solid foundation. Consider adding journaling to your study routine." };
}

function generateNarrative(s: {
  studyScore: number; journalScore: number; prayerScore: number;
  memoryScore: number; applicationScore: number; growthScore: number;
  overallScore: number; studyStreak: number; journalStreak: number;
  studyDays30: number; journalDays30: number; fruitAvg: number;
  avgLevel: number; recentStudies: number; recentJournals: number;
  gratitudeEntries: number; hasAssessment: boolean;
}): string {
  const parts: string[] = [];

  if (s.overallScore >= 80) {
    parts.push("🔥 You're on fire! Your spiritual disciplines are strong across the board.");
  } else if (s.overallScore >= 50) {
    parts.push("🌱 You're growing steadily. Your consistency is building a strong foundation.");
  } else if (s.overallScore >= 25) {
    parts.push("🛤️ You're on the path. Small, consistent steps will build momentum.");
  } else {
    parts.push("🌅 Every journey begins with a single step. Start your first study today!");
  }

  if (s.studyStreak >= 7) {
    parts.push(`Your ${s.studyStreak}-day study streak shows real dedication.`);
  } else if (s.studyStreak >= 3) {
    parts.push(`You've studied ${s.studyDays30} days this month — keep the streak alive!`);
  }

  if (s.journalStreak >= 3) {
    parts.push(`Journaling ${s.journalStreak} days in a row is creating deep reflection habits.`);
  }

  if (s.fruitAvg >= 3.5) {
    parts.push("Your fruit of the Spirit scores show strong evidence of the Spirit's work in your character.");
  } else if (s.fruitAvg >= 2) {
    parts.push("Keep tracking your fruit of the Spirit — self-awareness is the first step to growth.");
  }

  if (s.gratitudeEntries >= 5) {
    parts.push(`Your ${s.gratitudeEntries} gratitude entries show a thankful heart — that's a mark of spiritual maturity.`);
  }

  if (!s.hasAssessment) {
    parts.push("Take an assessment to discover your current level and see where you're growing strongest.");
  }

  return parts.join(" ");
}
