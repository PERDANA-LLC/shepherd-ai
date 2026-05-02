"use client";

import { useState } from "react";

interface VerseBreakdown {
  verse: string;
  text: string;
  explanation: string;
  cross_references: string[];
  word_study?: string;
}

interface StudyData {
  passage_reference: string;
  passage_text: string;
  historical_context?: string;
  verse_breakdown?: VerseBreakdown[];
  key_themes?: string[];
  application_questions?: string[];
  prayer_prompt?: string;
}

interface StudyResponse {
  success: boolean;
  reference: string;
  translation: string;
  study: StudyData;
}

export default function Home() {
  const [passage, setPassage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [study, setStudy] = useState<StudyResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage.trim()) return;

    setLoading(true);
    setError("");
    setStudy(null);

    try {
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage: passage.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setStudy(data);
      }
    } catch {
      setError("Could not connect to the study engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="text-center px-4 pt-20 pb-12 relative">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(88,166,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <span className="inline-block bg-[rgba(88,166,255,0.12)] border border-[rgba(88,166,255,0.25)] text-[#58a6ff] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
            AI-Powered KJV Bible Study
          </span>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            <span className="bg-gradient-to-br from-white via-[#58a6ff] to-[#a371f7] bg-clip-text text-transparent">
              Shepherd AI
            </span>
          </h1>
          <p className="text-[#8b949e] text-lg max-w-xl mx-auto mb-8">
            Enter any Bible passage. Get a complete KJV study — cross-references,
            word origins, historical context, and application questions. Powered by
            AI, guided by scripture.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 max-w-xl mx-auto"
          >
            <input
              type="text"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              placeholder='Try "John 3:16" or "Romans 8:28-30" or "Psalm 23"'
              className="flex-1 px-5 py-3.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] text-base placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !passage.trim()}
              className="px-6 py-3.5 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner />
                  Studying...
                </>
              ) : (
                "Study →"
              )}
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {[
              "John 3:16",
              "Romans 8:28",
              "Psalm 23",
              "Isaiah 53",
              "Matthew 5:1-12",
            ].map((ref) => (
              <button
                key={ref}
                onClick={() => setPassage(ref)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#21262d] text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#30363d] border border-[#30363d] transition-all"
              >
                {ref}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <div className="bg-[rgba(248,81,73,0.1)] border border-[rgba(248,81,73,0.3)] text-[#f85149] px-5 py-4 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-3xl mx-auto px-4 pb-16">
          <Skeleton />
        </div>
      )}

      {/* Study Results */}
      {study && !loading && (
        <main className="max-w-3xl mx-auto px-4 pb-20">
          <StudyResult study={study} />
        </main>
      )}

      {/* Empty state */}
      {!study && !loading && !error && (
        <div className="max-w-2xl mx-auto px-4 pb-20 text-center">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-[#8b949e]">
            Enter a passage above to begin your study.
            <br />
            <span className="text-sm mt-1 block">
              Try a single verse, a range, or an entire chapter.
            </span>
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[#30363d] text-[#484f58] text-xs">
        <p>
          Shepherd AI · Built for deeper KJV study · All scripture is public domain
        </p>
      </footer>
    </div>
  );
}

/* ─── Study Result Component ─── */
function StudyResult({ study }: { study: StudyResponse }) {
  const s = study.study;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{s.passage_reference}</h2>
          <span className="text-xs px-3 py-1 bg-[#21262d] rounded-full text-[#8b949e] border border-[#30363d]">
            {study.translation}
          </span>
        </div>
        <blockquote className="border-l-3 border-[#d2991d] pl-4 text-[#c9d1d9] leading-relaxed whitespace-pre-line italic">
          {s.passage_text}
        </blockquote>
      </div>

      {/* Historical Context */}
      {s.historical_context && (
        <SectionCard icon="🏛️" title="Historical Context">
          <p className="text-[#8b949e] leading-relaxed">{s.historical_context}</p>
        </SectionCard>
      )}

      {/* Verse-by-Verse Breakdown */}
      {s.verse_breakdown && s.verse_breakdown.length > 0 && (
        <SectionCard icon="📖" title="Verse-by-Verse Study">
          <div className="space-y-5">
            {s.verse_breakdown.map((v, i) => (
              <div
                key={i}
                className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5"
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[#58a6ff] font-mono font-bold text-sm">
                    {v.verse}
                  </span>
                  <span className="text-[#c9d1d9] italic text-sm">{v.text}</span>
                </div>
                <p className="text-[#8b949e] text-sm leading-relaxed mb-3">
                  {v.explanation}
                </p>
                {v.word_study && (
                  <div className="bg-[rgba(163,113,247,0.08)] border border-[rgba(163,113,247,0.2)] rounded-md px-3 py-2 text-xs text-[#a371f7] mb-3">
                    🔍 {v.word_study}
                  </div>
                )}
                {v.cross_references && v.cross_references.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {v.cross_references.map((ref, j) => (
                      <button
                        key={j}
                        onClick={() => {
                          const input = document.querySelector<HTMLInputElement>(
                            'input[type="text"]'
                          );
                          if (input) {
                            input.value = ref;
                            input.form?.requestSubmit();
                          }
                        }}
                        className="text-xs px-2.5 py-1 bg-[rgba(88,166,255,0.08)] border border-[rgba(88,166,255,0.2)] text-[#58a6ff] rounded-md hover:bg-[rgba(88,166,255,0.15)] transition-all cursor-pointer"
                      >
                        📎 {ref}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Key Themes */}
      {s.key_themes && s.key_themes.length > 0 && (
        <SectionCard icon="🔑" title="Key Themes">
          <div className="flex gap-2 flex-wrap">
            {s.key_themes.map((theme, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-[rgba(63,185,80,0.08)] border border-[rgba(63,185,80,0.2)] text-[#3fb950] text-sm rounded-full"
              >
                {theme}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Application Questions */}
      {s.application_questions && s.application_questions.length > 0 && (
        <SectionCard icon="💭" title="Application Questions">
          <ul className="space-y-3">
            {s.application_questions.map((q, i) => (
              <li key={i} className="flex gap-3 text-[#8b949e]">
                <span className="text-[#58a6ff] font-bold shrink-0">
                  {i + 1}.
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Prayer Prompt */}
      {s.prayer_prompt && (
        <SectionCard icon="🙏" title="Prayer Prompt">
          <p className="text-[#8b949e] leading-relaxed italic">{s.prayer_prompt}</p>
        </SectionCard>
      )}
    </div>
  );
}

/* ─── Reusable Section Card ─── */
function SectionCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
      <h3 className="text-sm font-semibold text-[#c9d1d9] mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ─── Spinner ─── */
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ─── Skeleton Loading ─── */
function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <div className="h-6 w-48 bg-[#21262d] rounded mb-3" />
        <div className="h-4 w-full bg-[#21262d] rounded mb-2" />
        <div className="h-4 w-3/4 bg-[#21262d] rounded" />
      </div>
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <div className="h-5 w-40 bg-[#21262d] rounded mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5">
              <div className="h-4 w-32 bg-[#21262d] rounded mb-2" />
              <div className="h-3 w-full bg-[#21262d] rounded mb-1" />
              <div className="h-3 w-5/6 bg-[#21262d] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
