"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import RadarChart from "@/components/RadarChart";

// ── Assessment questions (7 dimensions × 3 each) ───────────────

const DIMENSIONS = [
  {
    key: "bible_knowledge",
    label: "Bible Knowledge",
    emoji: "📖",
    color: "#3fb950",
    questions: [
      "I can name all 66 books of the Bible in order.",
      "I know the main themes and outline of each biblical book.",
      "I can recall key verses and their references from memory.",
    ],
  },
  {
    key: "theological_understanding",
    label: "Theological Understanding",
    emoji: "🏛️",
    color: "#d2991d",
    questions: [
      "I understand the core doctrines (Trinity, atonement, justification, sanctification).",
      "I can distinguish between Reformed, Arminian, and Catholic theological positions.",
      "I can trace how a doctrine develops across the Old and New Testaments.",
    ],
  },
  {
    key: "hermeneutics",
    label: "Hermeneutics",
    emoji: "🔍",
    color: "#58a6ff",
    questions: [
      "I know how to consider historical context, genre, and authorial intent when reading.",
      "I can identify different literary genres (poetry, prophecy, epistle, narrative) and interpret accordingly.",
      "I can explain the grammatico-historical method and the analogy of faith principle.",
    ],
  },
  {
    key: "church_history",
    label: "Church History",
    emoji: "📜",
    color: "#a371f7",
    questions: [
      "I can outline the major periods (Early Church, Reformation, Modern) and key figures.",
      "I understand how the Reformation recovered justification by faith alone.",
      "I can explain the development of the canon and major creeds (Nicene, Chalcedon, Westminster).",
    ],
  },
  {
    key: "practical_application",
    label: "Practical Application",
    emoji: "🛠️",
    color: "#f0883e",
    questions: [
      "I regularly apply what I read in Scripture to my daily decisions and relationships.",
      "I can help someone apply a passage without moralizing or missing the gospel.",
      "I have a consistent habit of Scripture memorization and meditation.",
    ],
  },
  {
    key: "prayer_life",
    label: "Prayer Life",
    emoji: "🙏",
    color: "#e5534b",
    questions: [
      "I pray daily with structure (ACTS: Adoration, Confession, Thanksgiving, Supplication).",
      "I can lead others in prayer with biblical substance, not just requests.",
      "I regularly pray Scripture back to God and intercede for specific people by name.",
    ],
  },
  {
    key: "teaching_ability",
    label: "Teaching Ability",
    emoji: "🎓",
    color: "#79c0ff",
    questions: [
      "I can explain a Bible passage clearly to someone at their level of understanding.",
      "I know how to prepare a lesson with a main point, supporting points, and application.",
      "I have led a Bible study or taught a class to a group of any size.",
    ],
  },
];

const SCALE_LABELS = ["Not at all", "Slightly", "Somewhat", "Mostly", "Absolutely"];

// ── Helpers ──────────────────────────────────────────────────────

function levelName(level: number): string {
  return ["", "5th Grade", "High School", "College", "PhD"][level] || "College";
}

function levelEmoji(level: number): string {
  return ["", "🟢", "🟡", "🔵", "🔴"][level] || "🔵";
}

// ── Main Component ───────────────────────────────────────────────

export default function AssessPage() {
  const { getToken, userId, isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [currentDim, setCurrentDim] = useState(0);
  const [scores, setScores] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const dim = DIMENSIONS[currentDim];
  const currentScores = scores[dim.key] || [];
  const progress = DIMENSIONS.reduce(
    (sum, d) => sum + (scores[d.key]?.length || 0), 0
  );

  const handleScore = (score: number) => {
    if (currentScores.length >= 3) return; // All questions answered for this dim
    setScores((prev) => ({
      ...prev,
      [dim.key]: [...(prev[dim.key] || []), score],
    }));
  };

  const handleNext = () => {
    if (currentDim < DIMENSIONS.length - 1) {
      setCurrentDim(currentDim + 1);
    }
  };

  const handleBack = () => {
    if (currentDim > 0) {
      // Clear current dimension to redo
      setScores((prev) => {
        const next = { ...prev };
        delete next[dim.key];
        return next;
      });
      setCurrentDim(currentDim - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, ...scores }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save assessment");
      } else {
        setResult(data.assessment);
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const allDone = DIMENSIONS.every((d) => (scores[d.key]?.length || 0) === 3);

  // ── Results view ─────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-[#0d1117] pt-12 px-4 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-5xl mb-4 block">{levelEmoji(result.study_level)}</span>
          <h1 className="text-3xl font-bold text-[#c9d1d9] mb-2">Assessment Complete</h1>
          <p className="text-[#8b949e] mb-2">
            Your study level: <strong className="text-[#58a6ff]">{result.level_name}</strong>
          </p>
          {result.teacher_level > 0 && (
            <p className="text-[#8b949e] text-sm mb-8">
              Teacher level: <strong className="text-[#a371f7]">{levelName(result.teacher_level)}</strong>
            </p>
          )}

          {/* Radar chart */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
            <RadarChart
              dimensions={DIMENSIONS.map((d) => ({
                label: d.label,
                value: result.dimensions[d.key] || 0,
                color: d.color,
              }))}
              size={320}
            />
          </div>

          {/* Dimension breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {DIMENSIONS.map((d) => (
              <div
                key={d.key}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-center"
              >
                <span className="text-lg">{d.emoji}</span>
                <p className="text-xs text-[#8b949e] mt-1">{d.label}</p>
                <p
                  className="text-lg font-bold mt-0.5"
                  style={{ color: d.color }}
                >
                  {(result.dimensions[d.key] || 0).toFixed(1)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/app/journal")}
              className="px-6 py-3 bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold rounded-lg transition-all"
            >
              Start Journaling →
            </button>
            <button
              onClick={() => router.push("/app")}
              className="px-6 py-3 bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] font-semibold rounded-lg transition-all"
            >
              Start Studying
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz view ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d1117] pt-12 px-4 pb-20">
      <div className="max-w-xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8b949e]">
              {progress} / 21 questions
            </span>
            <span className="text-xs text-[#484f58]">
              {Math.round((progress / 21) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3fb950] via-[#58a6ff] to-[#a371f7] rounded-full transition-all duration-500"
              style={{ width: `${(progress / 21) * 100}%` }}
            />
          </div>
          {/* Dimension indicators */}
          <div className="flex gap-1 mt-2">
            {DIMENSIONS.map((d, i) => {
              const done = (scores[d.key]?.length || 0) === 3;
              const active = i === currentDim;
              return (
                <div
                  key={d.key}
                  className="flex-1 h-1 rounded-full transition-all"
                  style={{
                    background: done
                      ? d.color
                      : active
                      ? `${d.color}40`
                      : "#21262d",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Dimension header */}
        <div className="text-center mb-8">
          <span className="text-3xl">{dim.emoji}</span>
          <h2 className="text-xl font-bold text-[#c9d1d9] mt-2">{dim.label}</h2>
          <p className="text-[#8b949e] text-sm mt-1">
            Question {currentScores.length + 1} of 3
          </p>
        </div>

        {/* Current question */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
          <p className="text-[#c9d1d9] text-base leading-relaxed mb-6">
            {dim.questions[currentScores.length]}
          </p>

          {/* Score buttons */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => handleScore(score)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  currentScores[currentScores.length - 1] === score
                    ? "border-[#58a6ff] bg-[rgba(88,166,255,0.1)] text-[#58a6ff]"
                    : "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] hover:border-[#484f58]"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span>{SCALE_LABELS[score - 1]}</span>
                  <span className="text-[#484f58]">{score}/5</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentDim === 0}
            className="px-4 py-2 text-[#8b949e] hover:text-[#c9d1d9] disabled:text-[#30363d] transition-all text-sm"
          >
            ← Back
          </button>

          {allDone ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-semibold rounded-lg transition-all text-sm flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "See Results →"
              )}
            </button>
          ) : (
            currentScores.length === 3 && (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] font-semibold rounded-lg transition-all text-sm"
              >
                Next: {DIMENSIONS[currentDim + 1]?.emoji}{" "}
                {DIMENSIONS[currentDim + 1]?.label} →
              </button>
            )
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-[rgba(248,81,73,0.1)] border border-[rgba(248,81,73,0.3)] text-[#f85149] rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
