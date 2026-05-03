"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import RadarChart from "@/components/RadarChart";

// ── Types ──────────────────────────────────────────────────────

interface FlywheelData {
  scorecard: {
    overall: number;
    dimensions: Record<string, { score: number; label: string; emoji: string }>;
  };
  stats: {
    study_streak: number;
    journal_streak: number;
    studies_30d: number;
    journals_30d: number;
    total_studies: number;
    total_journals: number;
    avg_fruit_score: number;
    current_level: number;
    gratitude_entries_30d: number;
    workbooks_30d: number;
    assessment: { study_level: number; teacher_level: number; date: string } | null;
  };
  narrative: string;
  heatmap: Record<string, { studies: number; journals: number; score: number }>;
  timeline: { date: string; type: string; label: string }[];
  plateau: { status: string; message: string; suggestion?: string };
}

// ── Spinner ────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Main Page ──────────────────────────────────────────────────

export default function FlywheelPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FlywheelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSignedIn) loadData();
  }, [isSignedIn]);

  const loadData = async () => {
    try {
      const res = await fetch("/api/flywheel");
      if (res.ok) {
        setData(await res.json());
      } else {
        setError("Could not load flywheel data");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#58a6ff] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center"><Spinner /><p className="text-[#8b949e] text-sm mt-3">Crunching your growth data...</p></div>
      </div>
    );
  }

  if (!data) return null;

  // ── Render ─────────────────────────────────────────────────
  const dims = data.scorecard.dimensions;
  const dimArray = Object.values(dims);
  const colors = ["#3fb950", "#d2991d", "#58a6ff", "#a371f7", "#f0883e", "#e5534b", "#79c0ff"];

  return (
    <div className="min-h-screen bg-[#0d1117] pt-6 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#c9d1d9]">📈 Growth Flywheel</h1>
            <p className="text-[#8b949e] text-sm">30-day spiritual growth report</p>
          </div>
          <button onClick={loadData} className="text-xs text-[#58a6ff] hover:underline">
            Refresh
          </button>
        </div>

        {/* Plateau alert */}
        {data.plateau.status !== "growing" && (
          <div className={`rounded-xl p-4 mb-6 border ${
            data.plateau.status === "just_started"
              ? "bg-[rgba(88,166,255,0.06)] border-[rgba(88,166,255,0.15)] text-[#58a6ff]"
              : "bg-[rgba(210,153,29,0.06)] border-[rgba(210,153,29,0.15)] text-[#d2991d]"
          }`}>
            <p className="text-sm">{data.plateau.message}</p>
            {data.plateau.suggestion === "journal" && (
              <a href="/app/journal" className="text-xs mt-2 inline-block underline">→ Start journaling</a>
            )}
            {data.plateau.suggestion === "assessment" && (
              <a href="/app/assess" className="text-xs mt-2 inline-block underline">→ Take assessment</a>
            )}
          </div>
        )}

        {/* ── Top row: Score gauge + Stats cards ── */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Overall score gauge */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col items-center justify-center">
            <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-3">Overall Score</p>
            <div className="relative w-40 h-40 mb-3">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="68" fill="none" stroke="#21262d" strokeWidth="12" />
                <circle
                  cx="80" cy="80" r="68" fill="none"
                  stroke={data.scorecard.overall >= 70 ? "#3fb950" : data.scorecard.overall >= 40 ? "#d2991d" : "#58a6ff"}
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${(data.scorecard.overall / 100) * 427} 427`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-[#c9d1d9]">{data.scorecard.overall}</span>
              </div>
            </div>
            <p className="text-xs text-[#8b949e] text-center">{data.scorecard.overall >= 70 ? "Strong" : data.scorecard.overall >= 40 ? "Growing" : "Starting"}</p>
          </div>

          {/* Stats grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon="📖" label="Study Streak" value={`${data.stats.study_streak}d`} sub={`${data.stats.studies_30d}/30 days`} color="#58a6ff" />
            <StatCard icon="📔" label="Journal Streak" value={`${data.stats.journal_streak}d`} sub={`${data.stats.journals_30d}/30 days`} color="#3fb950" />
            <StatCard icon="🍇" label="Avg Fruit Score" value={data.stats.avg_fruit_score.toFixed(1)} sub="out of 5" color="#a371f7" />
            <StatCard icon="📚" label="Total Studies" value={String(data.stats.total_studies)} sub={`Level ~${data.stats.current_level}`} color="#d2991d" />
            <StatCard icon="🙏" label="Gratitude" value={String(data.stats.gratitude_entries_30d)} sub="this month" color="#f0883e" />
            <StatCard icon="📄" label="Workbooks" value={String(data.stats.workbooks_30d)} sub="generated" color="#79c0ff" />
          </div>
        </div>

        {/* ── Radar chart ── */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#c9d1d9] mb-4">7-Dimension Growth Profile</h2>
          <RadarChart
            dimensions={dimArray.map((d, i) => ({
              label: d.label,
              value: d.score / 20, // Scale 0-100 → 0-5 for radar chart
              color: colors[i],
            }))}
            size={340}
          />
        </div>

        {/* ── Narrative ── */}
        <div className="bg-[rgba(88,166,255,0.05)] border border-[rgba(88,166,255,0.12)] rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#58a6ff] mb-3">📝 Your 30-Day Report</h2>
          <p className="text-[#c9d1d9] text-sm leading-relaxed">{data.narrative}</p>
        </div>

        {/* ── Dimension breakdown ── */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {dimArray.map((d, i) => (
            <div key={d.label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#c9d1d9]">{d.emoji} {d.label}</span>
                <span className="text-sm font-bold" style={{ color: colors[i] }}>{d.score}</span>
              </div>
              <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${d.score}%`, backgroundColor: colors[i] }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Calendar heatmap ── */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#c9d1d9] mb-4">📅 30-Day Activity Heatmap</h2>
          <HeatmapGrid data={data.heatmap} />
        </div>

        {/* ── Timeline ── */}
        {data.timeline.length > 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-[#c9d1d9] mb-4">🕐 Recent Activity</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.timeline.slice(0, 20).map((evt, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-[#484f58] w-20 shrink-0">
                    {new Date(evt.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-base">
                    {evt.type === "study" ? "📖" : evt.type === "journal" ? "📔" : evt.type === "assessment" ? "📊" : "📄"}
                  </span>
                  <span className="text-[#8b949e] truncate">{evt.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {data.stats.total_studies === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">🚀</span>
            <p className="text-[#c9d1d9] text-lg font-semibold mb-2">Your flywheel starts today</p>
            <p className="text-[#8b949e] text-sm mb-6">
              Start studying, journaling, and assessing — your growth data will appear here.
            </p>
            <a href="/app" className="px-6 py-3 bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold rounded-lg transition-all text-sm">
              Start Your First Study →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
      <span className="text-xl">{icon}</span>
      <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
      <p className="text-xs text-[#c9d1d9] font-medium">{label}</p>
      <p className="text-[10px] text-[#484f58] mt-0.5">{sub}</p>
    </div>
  );
}

// ── Heatmap Grid ───────────────────────────────────────────────

function HeatmapGrid({ data }: { data: Record<string, { score: number }> }) {
  const today = new Date();
  const days: { date: string; dayOfWeek: number; score: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    days.push({
      date: ds,
      dayOfWeek: d.getDay(),
      score: data[ds]?.score || 0,
    });
  }

  // Organize by weeks
  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];

  // Pad start for proper alignment
  const firstDay = days[0].dayOfWeek;
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: "", dayOfWeek: i, score: -1 });
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  function heatColor(score: number): string {
    if (score < 0) return "transparent";
    if (score === 0) return "#161b22";
    if (score <= 2) return "#0e4429";
    if (score <= 3) return "#006d32";
    if (score <= 5) return "#26a641";
    return "#39d353";
  }

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-5 h-3 flex items-center justify-center">
              <span className="text-[9px] text-[#484f58]">{i % 2 === 0 ? d : ""}</span>
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={`${wi}-${di}`}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: heatColor(day.score) }}
                title={day.date ? `${day.date}: ${day.score} pts` : ""}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[10px] text-[#484f58] mr-1">Less</span>
        {[-1, 0, 1, 3, 5].map((s, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: heatColor(s) }} />
        ))}
        <span className="text-[10px] text-[#484f58] ml-1">More</span>
      </div>
    </div>
  );
}
