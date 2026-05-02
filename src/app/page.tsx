"use client";

import { useState, useEffect } from "react";
import { downloadStudyPDF } from "@/lib/pdf";

// ── TypeScript Interfaces ──────────────────────────────────────────

type StudyLevel = 1 | 2 | 3 | 4;

interface LevelConfig {
  level: StudyLevel;
  name: string;
  emoji: string;
  description: string;
}

const LEVELS: LevelConfig[] = [
  { level: 1, name: "5th Grade", emoji: "🟢", description: "Age 10-11 · Simple, concrete, memorable" },
  { level: 2, name: "High School", emoji: "🟡", description: "Age 14-18 · Real, relevant, honest" },
  { level: 3, name: "College", emoji: "🔵", description: "Critical thinking, context, debate" },
  { level: 4, name: "PhD", emoji: "🔴", description: "Exegesis, scholarship, original contribution" },
];

// Level 1 — 5th Grader
interface L1MemoryVerse { verse: string; text: string; hand_motion: string; }
interface L1Study {
  passage_reference: string; passage_text: string; level: 1; level_name: string;
  big_idea: string; memory_verse: L1MemoryVerse; picture_this: string;
  think_about_it: string[]; try_this: string; talk_to_god: string; show_someone: string;
}

// Level 2 — High Schooler
interface L2Verse { verse: string; text: string; context: string; }
interface L2Study {
  passage_reference: string; passage_text: string; level: 2; level_name: string;
  the_hook: string; the_text: L2Verse[]; what_it_really_means: string;
  the_clash: string; your_turn: string[]; this_week: string; prayer: string;
}

// Level 3 — College
interface L3WordStudy { word: string; strongs: string; definition: string; semantic_range: string; other_uses: string[]; }
interface L3InterpretiveOption { view: string; description: string; strength: string; weakness: string; }
interface L3Pitfall { misunderstanding: string; consequence: string; corrective_verse: string; }
interface L3Study {
  passage_reference: string; passage_text: string; level: 3; level_name: string;
  thesis_statement: string;
  text_and_context: { historical_background: string; literary_context: string; authorial_intent: string };
  word_study: L3WordStudy;
  interpretive_options: L3InterpretiveOption[];
  reformed_view: string;
  theological_pitfalls: L3Pitfall;
  discussion_questions: string[];
  research_assignment: string;
  teach_it: string;
}

// Level 4 — PhD
interface L4Exegesis { verse: string; greek_or_hebrew: string; parsing: string; syntax: string; textual_variants?: string; lxx_background?: string; }
interface L4Philology { word: string; etymology: string; cognates: string; diachronic_development: string; synchronic_usage: string; dictionary_entries: string; }
interface L4Debate { position: string; scholar: string; argument: string; presuppositions: string; }
interface L4Bibliography { source: string; type: string; annotation: string; }
interface L4Systematic { locus: string; explanation: string; }
interface L4Sermon { titles: string[]; outline: string; tough_questions: string[]; }
interface L4Study {
  passage_reference: string; passage_text: string; level: 4; level_name: string;
  research_question: string;
  exegetical_analysis: L4Exegesis[];
  philological_deep_dive: L4Philology;
  scholarly_debate: L4Debate[];
  reformed_position: string;
  pastoral_note: string;
  annotated_bibliography: L4Bibliography[];
  systematic_theology_connection: L4Systematic;
  sermon_prep: L4Sermon;
  original_contribution: string;
  research_plan: string;
}

// Legacy study format (backward compatible)
interface LegacyVerse { verse: string; text: string; explanation: string; cross_references: string[]; word_study?: string; }
interface LegacyStudy {
  passage_reference: string; passage_text: string;
  historical_context?: string; verse_breakdown?: LegacyVerse[];
  key_themes?: string[]; application_questions?: string[]; prayer_prompt?: string;
}

type StudyData = L1Study | L2Study | L3Study | L4Study | LegacyStudy;

interface StudyResponse {
  success: boolean;
  reference: string;
  translation: string;
  level?: number;
  level_name?: string;
  study: StudyData;
}

interface HistoryEntry {
  id: string;
  reference: string;
  date: string;
  study: StudyResponse;
}

const HISTORY_KEY = "shepherd-ai-history";
const MAX_HISTORY = 20;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

function saveToHistory(study: StudyResponse): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const filtered = history.filter((h) => h.reference !== study.reference);
  filtered.unshift({ id: Date.now().toString(36), reference: study.reference, date: new Date().toLocaleString(), study });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_HISTORY)));
}

function clearHistory(): void { localStorage.removeItem(HISTORY_KEY); }

// ── Home Component ─────────────────────────────────────────────────

export default function Home() {
  const [passage, setPassage] = useState("");
  const [level, setLevel] = useState<StudyLevel>(3); // default: College
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [study, setStudy] = useState<StudyResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage.trim()) return;
    setLoading(true); setError(""); setStudy(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120_000);
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage: passage.trim(), level }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { setError("The server returned an unexpected response. Please try again."); return; }
      if (!res.ok) { setError(data.error || `Server error (${res.status}).`); }
      else { setStudy(data); saveToHistory(data); setHistory(loadHistory()); }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("The study took too long. Try a shorter passage like a single verse.");
      } else {
        setError("Could not connect to the study engine. Check your internet and try again.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="text-center px-4 pt-16 pb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(88,166,255,0.08) 0%, transparent 70%)" }} />
        <div className="relative">
          <span className="inline-block bg-[rgba(88,166,255,0.12)] border border-[rgba(88,166,255,0.25)] text-[#58a6ff] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
            AI-Powered KJV Bible Study
          </span>
          <h1 className="text-5xl font-extrabold mb-3 tracking-tight">
            <span className="bg-gradient-to-br from-white via-[#58a6ff] to-[#a371f7] bg-clip-text text-transparent">Shepherd AI</span>
          </h1>
          <p className="text-[#8b949e] text-lg max-w-xl mx-auto mb-6">
            Enter any Bible passage. Choose your study level. Get a complete KJV study tailored to your audience.
          </p>

          {/* Search + Level Selector */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-3">
            <div className="flex gap-3">
              <input
                type="text" value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder='Try "John 3:16" or "Romans 8:28-30" or "Psalm 23"'
                className="flex-1 px-5 py-3.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] text-base placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !passage.trim()}
                className="px-6 py-3.5 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2">
                {loading ? <><Spinner /> Studying...</> : "Study →"}
              </button>
            </div>

            {/* Level Selector */}
            <div className="flex gap-1.5 justify-center">
              {LEVELS.map((l) => (
                <button key={l.level} type="button"
                  onClick={() => setLevel(l.level)}
                  disabled={loading}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all font-medium ${
                    level === l.level
                      ? l.level === 1 ? "bg-[rgba(63,185,80,0.12)] border-[rgba(63,185,80,0.3)] text-[#3fb950]"
                      : l.level === 2 ? "bg-[rgba(210,153,29,0.12)] border-[rgba(210,153,29,0.3)] text-[#d2991d]"
                      : l.level === 3 ? "bg-[rgba(88,166,255,0.12)] border-[rgba(88,166,255,0.3)] text-[#58a6ff]"
                      : "bg-[rgba(163,113,247,0.12)] border-[rgba(163,113,247,0.3)] text-[#a371f7]"
                      : "bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#484f58]"
                  }`}
                  title={l.description}>
                  {l.emoji} {l.name}
                </button>
              ))}
            </div>

            {/* Quick suggestions */}
            <div className="flex gap-2 justify-center flex-wrap">
              {["John 3:16", "Romans 8:28", "Psalm 23", "Isaiah 53", "Matthew 5:1-12"].map((ref) => (
                <button key={ref} onClick={() => setPassage(ref)}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#21262d] text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#30363d] border border-[#30363d] transition-all">{ref}</button>
              ))}
              {history.length > 0 && (
                <button onClick={() => setShowHistory(!showHistory)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    showHistory ? "bg-[rgba(88,166,255,0.12)] border-[rgba(88,166,255,0.3)] text-[#58a6ff]"
                    : "bg-[#21262d] text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#30363d] border-[#30363d]"}`}>
                  📋 History ({history.length})
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <div className="bg-[rgba(248,81,73,0.1)] border border-[rgba(248,81,73,0.3)] text-[#f85149] px-5 py-4 rounded-lg text-sm">{error}</div>
        </div>
      )}

      {/* Loading */}
      {loading && <div className="max-w-3xl mx-auto px-4 pb-16"><Skeleton /></div>}

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
            Enter a passage above, choose your level, and begin.
            <br /><span className="text-sm mt-1 block">Try a single verse, a range, or an entire chapter.</span>
          </p>
        </div>
      )}

      {/* History */}
      {showHistory && history.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#c9d1d9] flex items-center gap-2">📋 Recent Studies</h3>
              <button onClick={() => { clearHistory(); setHistory([]); setShowHistory(false); }}
                className="text-xs px-2.5 py-1 bg-[#21262d] text-[#8b949e] hover:text-[#f85149] rounded-md border border-[#30363d] transition-all">Clear All</button>
            </div>
            <div className="space-y-2">
              {history.map((entry) => (
                <button key={entry.id} onClick={() => { setStudy(entry.study); setError(""); setShowHistory(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="w-full text-left bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff] rounded-lg px-4 py-3 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[#58a6ff] font-medium text-sm group-hover:text-[#79c0ff]">
                      {entry.reference}
                      {entry.study.level_name && <span className="ml-2 text-[#484f58] text-xs">· {entry.study.level_name}</span>}
                    </span>
                    <span className="text-[#484f58] text-xs">{entry.date}</span>
                  </div>
                  <p className="text-[#8b949e] text-xs mt-1 line-clamp-1">
                    {entry.study.study.passage_text?.slice(0, 120)}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-8 border-t border-[#30363d] text-[#484f58] text-xs">
        <p>Shepherd AI · Built for deeper KJV study · All scripture is public domain</p>
      </footer>
    </div>
  );
}

// ── Study Result (level-aware) ─────────────────────────────────────

function StudyResult({ study }: { study: StudyResponse }) {
  const s = study.study;
  const level = (s as any).level || 0;

  // Detect legacy format (no level field — pre-v4 studies)
  const isLegacy = !level || level < 1 || level > 4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{s.passage_reference}</h2>
            {!isLegacy && <LevelBadge level={level} />}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadStudyPDF(study)}
              className="text-xs px-3 py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-lg font-medium transition-all flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg> PDF
            </button>
            <span className="text-xs px-3 py-1 bg-[#21262d] rounded-full text-[#8b949e] border border-[#30363d]">{study.translation}</span>
          </div>
        </div>
        <blockquote className="border-l-3 border-[#d2991d] pl-4 text-[#c9d1d9] leading-relaxed whitespace-pre-line italic">{s.passage_text}</blockquote>
      </div>

      {/* Level-specific rendering */}
      {isLegacy ? <LegacyResult study={s as LegacyStudy} /> : <LevelResult study={s} level={level} />}
    </div>
  );
}

function LevelBadge({ level }: { level: number }) {
  const colors: Record<number, string> = { 1: "bg-[rgba(63,185,80,0.12)] border-[rgba(63,185,80,0.3)] text-[#3fb950]", 2: "bg-[rgba(210,153,29,0.12)] border-[rgba(210,153,29,0.3)] text-[#d2991d]", 3: "bg-[rgba(88,166,255,0.12)] border-[rgba(88,166,255,0.3)] text-[#58a6ff]", 4: "bg-[rgba(163,113,247,0.12)] border-[rgba(163,113,247,0.3)] text-[#a371f7]" };
  const emojis = ["", "🟢", "🟡", "🔵", "🔴"];
  const names = ["", "5th Grade", "High School", "College", "PhD"];
  return <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${colors[level] || ""}`}>{emojis[level]} {names[level]}</span>;
}

function LevelResult({ study, level }: { study: any; level: number }) {
  switch (level) {
    case 1: return <L1Result study={study as L1Study} />;
    case 2: return <L2Result study={study as L2Study} />;
    case 3: return <L3Result study={study as L3Study} />;
    case 4: return <L4Result study={study as L4Study} />;
    default: return <LegacyResult study={study as LegacyStudy} />;
  }
}

// ── Level 1: 5th Grader ────────────────────────────────────────────

function L1Result({ study: s }: { study: L1Study }) {
  return (
    <div className="space-y-4">
      <Card icon="📌" title="The Big Idea" color="green">
        <p className="text-lg font-semibold text-[#c9d1d9]">{s.big_idea}</p>
      </Card>
      <Card icon="📖" title="Memory Verse" color="green">
        <p className="text-[#3fb950] font-mono font-bold text-sm mb-1">{s.memory_verse.verse}</p>
        <p className="text-[#c9d1d9] italic text-sm mb-2">{s.memory_verse.text}</p>
        <p className="text-[#8b949e] text-sm">🖐️ {s.memory_verse.hand_motion}</p>
      </Card>
      <Card icon="🎨" title="Picture This" color="green">
        <p className="text-[#8b949e] leading-relaxed">{s.picture_this}</p>
      </Card>
      <Card icon="❓" title="Think About It" color="green">
        <ul className="space-y-2">
          {s.think_about_it?.map((q, i) => <li key={i} className="flex gap-2 text-[#8b949e]"><span className="text-[#3fb950] font-bold">{i + 1}.</span><span>{q}</span></li>)}
        </ul>
      </Card>
      <Card icon="🎮" title="Try This" color="green">
        <p className="text-[#8b949e] leading-relaxed">{s.try_this}</p>
      </Card>
      <Card icon="🙏" title="Talk to God" color="green">
        <p className="text-[#8b949e] leading-relaxed italic">{s.talk_to_god}</p>
      </Card>
      <Card icon="⭐" title="Show Someone" color="green">
        <p className="text-[#8b949e] leading-relaxed">{s.show_someone}</p>
      </Card>
    </div>
  );
}

// ── Level 2: High Schooler ─────────────────────────────────────────

function L2Result({ study: s }: { study: L2Study }) {
  return (
    <div className="space-y-4">
      <Card icon="🎬" title="The Hook" color="yellow">
        <p className="text-[#8b949e] leading-relaxed">{s.the_hook}</p>
      </Card>
      <Card icon="📖" title="The Text" color="yellow">
        <div className="space-y-4">
          {s.the_text?.map((v, i) => (
            <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
              <p className="text-[#d2991d] font-mono font-bold text-sm mb-1">{v.verse}</p>
              <p className="text-[#c9d1d9] italic text-sm mb-2">{v.text}</p>
              <p className="text-[#8b949e] text-sm">{v.context}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card icon="🔍" title="What It Really Means" color="yellow">
        <p className="text-[#8b949e] leading-relaxed">{s.what_it_really_means}</p>
      </Card>
      <Card icon="⚡" title="The Clash" color="yellow">
        <p className="text-[#8b949e] leading-relaxed">{s.the_clash}</p>
      </Card>
      <Card icon="🧠" title="Your Turn" color="yellow">
        <ul className="space-y-2">
          {s.your_turn?.map((q, i) => <li key={i} className="flex gap-2 text-[#8b949e]"><span className="text-[#d2991d] font-bold">{i + 1}.</span><span>{q}</span></li>)}
        </ul>
      </Card>
      <Card icon="🛠️" title="This Week" color="yellow">
        <p className="text-[#8b949e] leading-relaxed">{s.this_week}</p>
      </Card>
      <Card icon="🙏" title="Prayer" color="yellow">
        <p className="text-[#8b949e] leading-relaxed italic">{s.prayer}</p>
      </Card>
    </div>
  );
}

// ── Level 3: College ───────────────────────────────────────────────

function L3Result({ study: s }: { study: L3Study }) {
  return (
    <div className="space-y-4">
      <Card icon="📌" title="Thesis Statement" color="blue">
        <p className="text-[#c9d1d9] font-medium">{s.thesis_statement}</p>
      </Card>
      <Card icon="📖" title="Text & Context" color="blue">
        <div className="space-y-3 text-sm text-[#8b949e]">
          <div><span className="text-[#58a6ff] font-semibold">Historical Background:</span> {s.text_and_context?.historical_background}</div>
          <div><span className="text-[#58a6ff] font-semibold">Literary Context:</span> {s.text_and_context?.literary_context}</div>
          <div><span className="text-[#58a6ff] font-semibold">Authorial Intent:</span> {s.text_and_context?.authorial_intent}</div>
        </div>
      </Card>
      <Card icon="🔤" title="Word Study" color="blue">
        <div className="text-sm text-[#8b949e] space-y-1">
          <p><span className="text-[#58a6ff] font-mono font-bold">{s.word_study?.word}</span> <span className="text-[#484f58]">({s.word_study?.strongs})</span></p>
          <p><span className="font-semibold">Definition:</span> {s.word_study?.definition}</p>
          <p><span className="font-semibold">Semantic Range:</span> {s.word_study?.semantic_range}</p>
          {s.word_study?.other_uses?.length > 0 && (
            <div><span className="font-semibold">Other Uses:</span>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                {s.word_study.other_uses.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </div>
          )}
        </div>
      </Card>
      <Card icon="📊" title="Interpretive Options" color="blue">
        <div className="space-y-3">
          {s.interpretive_options?.map((opt, i) => (
            <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm">
              <p className="text-[#58a6ff] font-semibold mb-1">{opt.view}</p>
              <p className="text-[#8b949e] mb-2">{opt.description}</p>
              <div className="flex gap-4 text-xs">
                <span className="text-[#3fb950]">✓ {opt.strength}</span>
                <span className="text-[#d2991d]">⚠ {opt.weakness}</span>
              </div>
            </div>
          ))}
          {s.reformed_view && (
            <div className="bg-[rgba(88,166,255,0.06)] border border-[rgba(88,166,255,0.15)] rounded-lg p-3 text-sm">
              <span className="text-[#58a6ff] font-semibold">Reformed View:</span> <span className="text-[#8b949e]">{s.reformed_view}</span>
            </div>
          )}
        </div>
      </Card>
      <Card icon="⚠️" title="Theological Pitfalls" color="blue">
        <div className="text-sm text-[#8b949e] space-y-2">
          <p><span className="font-semibold">Misunderstanding:</span> {s.theological_pitfalls?.misunderstanding}</p>
          <p><span className="font-semibold">Consequence:</span> {s.theological_pitfalls?.consequence}</p>
          <p className="text-[#58a6ff] font-mono">{s.theological_pitfalls?.corrective_verse}</p>
        </div>
      </Card>
      <Card icon="❓" title="Discussion Questions" color="blue">
        <ul className="space-y-2">
          {s.discussion_questions?.map((q, i) => <li key={i} className="flex gap-2 text-[#8b949e] text-sm"><span className="text-[#58a6ff] font-bold">{i + 1}.</span><span>{q}</span></li>)}
        </ul>
      </Card>
      <Card icon="🎓" title="Research Assignment" color="blue">
        <p className="text-[#8b949e] text-sm leading-relaxed">{s.research_assignment}</p>
      </Card>
      <Card icon="🎯" title="Teach It" color="blue">
        <p className="text-[#8b949e] text-sm leading-relaxed whitespace-pre-line">{s.teach_it}</p>
      </Card>
    </div>
  );
}

// ── Level 4: PhD ───────────────────────────────────────────────────

function L4Result({ study: s }: { study: L4Study }) {
  return (
    <div className="space-y-4">
      <Card icon="🔬" title="Research Question" color="purple">
        <p className="text-[#c9d1d9] font-medium italic">{s.research_question}</p>
      </Card>
      <Card icon="📖" title="Exegetical Analysis" color="purple">
        <div className="space-y-4">
          {s.exegetical_analysis?.map((v, i) => (
            <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm">
              <p className="text-[#a371f7] font-mono font-bold mb-2">{v.verse}</p>
              {v.greek_or_hebrew && <p className="text-[#c9d1d9] font-mono mb-2">{v.greek_or_hebrew}</p>}
              <div className="space-y-1 text-[#8b949e]">
                <p><span className="text-[#a371f7] font-semibold">Parsing:</span> {v.parsing}</p>
                <p><span className="text-[#a371f7] font-semibold">Syntax:</span> {v.syntax}</p>
                {v.textual_variants && <p><span className="text-[#a371f7] font-semibold">Variants:</span> {v.textual_variants}</p>}
                {v.lxx_background && <p><span className="text-[#a371f7] font-semibold">LXX:</span> {v.lxx_background}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card icon="🔤" title="Philological Deep Dive" color="purple">
        <div className="text-sm text-[#8b949e] space-y-2">
          <p><span className="text-[#a371f7] font-mono font-bold">{s.philological_deep_dive?.word}</span></p>
          <p><span className="font-semibold">Etymology:</span> {s.philological_deep_dive?.etymology}</p>
          <p><span className="font-semibold">Cognates:</span> {s.philological_deep_dive?.cognates}</p>
          <p><span className="font-semibold">Diachronic:</span> {s.philological_deep_dive?.diachronic_development}</p>
          <p><span className="font-semibold">Synchronic:</span> {s.philological_deep_dive?.synchronic_usage}</p>
          <p><span className="font-semibold">Dictionaries:</span> {s.philological_deep_dive?.dictionary_entries}</p>
        </div>
      </Card>
      <Card icon="⚔️" title="Scholarly Debate" color="purple">
        <div className="space-y-3">
          {s.scholarly_debate?.map((d, i) => (
            <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm">
              <p className="text-[#a371f7] font-semibold mb-1">{d.position}{d.scholar ? ` — ${d.scholar}` : ""}</p>
              <p className="text-[#8b949e] mb-2">{d.argument}</p>
              <p className="text-[#484f58] text-xs">Presuppositions: {d.presuppositions}</p>
            </div>
          ))}
          {s.reformed_position && (
            <div className="bg-[rgba(163,113,247,0.06)] border border-[rgba(163,113,247,0.15)] rounded-lg p-3 text-sm">
              <span className="text-[#a371f7] font-semibold">Reformed Position:</span> <span className="text-[#8b949e]">{s.reformed_position}</span>
            </div>
          )}
          {s.pastoral_note && (
            <div className="bg-[rgba(248,81,73,0.06)] border border-[rgba(248,81,73,0.15)] rounded-lg p-3 text-sm">
              <span className="text-[#f85149] font-semibold">⚠ Pastoral Note:</span> <span className="text-[#8b949e]">{s.pastoral_note}</span>
            </div>
          )}
        </div>
      </Card>
      <Card icon="📚" title="Annotated Bibliography" color="purple">
        <div className="space-y-2">
          {s.annotated_bibliography?.map((b, i) => (
            <div key={i} className="text-sm"><span className="text-[#a371f7] font-semibold">{b.source}</span> <span className="text-[#484f58] text-xs">[{b.type}]</span><p className="text-[#8b949e] mt-0.5">{b.annotation}</p></div>
          ))}
        </div>
      </Card>
      <Card icon="🏛️" title="Systematic Theology" color="purple">
        <div className="text-sm text-[#8b949e]">
          <p><span className="text-[#a371f7] font-semibold">Locus:</span> {s.systematic_theology_connection?.locus}</p>
          <p className="mt-1">{s.systematic_theology_connection?.explanation}</p>
        </div>
      </Card>
      <Card icon="🎤" title="Sermon Preparation" color="purple">
        <div className="text-sm space-y-3">
          <div><span className="text-[#a371f7] font-semibold">Titles:</span>
            <ul className="list-disc pl-5 mt-1 text-[#8b949e] space-y-0.5">{s.sermon_prep?.titles?.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
          <div><span className="text-[#a371f7] font-semibold">Outline:</span><p className="text-[#8b949e] mt-1 whitespace-pre-line">{s.sermon_prep?.outline}</p></div>
          <div><span className="text-[#a371f7] font-semibold">Tough Questions:</span>
            <ul className="list-disc pl-5 mt-1 text-[#8b949e] space-y-1">{s.sermon_prep?.tough_questions?.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </div>
        </div>
      </Card>
      <Card icon="🧪" title="Original Contribution" color="purple">
        <p className="text-[#8b949e] text-sm leading-relaxed">{s.original_contribution}</p>
      </Card>
      <Card icon="🗓️" title="30-Day Research Plan" color="purple">
        <p className="text-[#8b949e] text-sm leading-relaxed whitespace-pre-line">{s.research_plan}</p>
      </Card>
    </div>
  );
}

// ── Legacy (pre-v4 studies) ────────────────────────────────────────

function LegacyResult({ study: s }: { study: LegacyStudy }) {
  return (
    <div className="space-y-4">
      {s.historical_context && <Card icon="🏛️" title="Historical Context"><p className="text-[#8b949e] leading-relaxed">{s.historical_context}</p></Card>}
      {s.verse_breakdown && s.verse_breakdown.length > 0 && (
        <Card icon="📖" title="Verse-by-Verse Study">
          <div className="space-y-5">
            {s.verse_breakdown.map((v, i) => (
              <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[#58a6ff] font-mono font-bold text-sm">{v.verse}</span>
                  <span className="text-[#c9d1d9] italic text-sm">{v.text}</span>
                </div>
                <p className="text-[#8b949e] text-sm leading-relaxed mb-3">{v.explanation}</p>
                {v.word_study && <WordStudy text={v.word_study} />}
                {v.cross_references && v.cross_references.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {v.cross_references.map((ref, j) => (
                      <button key={j} onClick={() => {
                        const input = document.querySelector<HTMLInputElement>('input[type="text"]');
                        if (input) { input.value = ref; input.form?.requestSubmit(); }
                      }} className="text-xs px-2.5 py-1 bg-[rgba(88,166,255,0.08)] border border-[rgba(88,166,255,0.2)] text-[#58a6ff] rounded-md hover:bg-[rgba(88,166,255,0.15)] transition-all cursor-pointer">📎 {ref}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
      {s.key_themes && s.key_themes.length > 0 && (
        <Card icon="🔑" title="Key Themes">
          <div className="flex gap-2 flex-wrap">{s.key_themes.map((t, i) => <span key={i} className="px-3 py-1.5 bg-[rgba(63,185,80,0.08)] border border-[rgba(63,185,80,0.2)] text-[#3fb950] text-sm rounded-full">{t}</span>)}</div>
        </Card>
      )}
      {s.application_questions && s.application_questions.length > 0 && (
        <Card icon="💭" title="Application Questions">
          <ul className="space-y-3">{s.application_questions.map((q, i) => <li key={i} className="flex gap-3 text-[#8b949e]"><span className="text-[#58a6ff] font-bold shrink-0">{i + 1}.</span><span>{q}</span></li>)}</ul>
        </Card>
      )}
      {s.prayer_prompt && <Card icon="🙏" title="Prayer Prompt"><p className="text-[#8b949e] leading-relaxed italic">{s.prayer_prompt}</p></Card>}
    </div>
  );
}

// ── Reusable Components ────────────────────────────────────────────

function Card({ icon, title, children, color = "blue" }: { icon: string; title: string; children: React.ReactNode; color?: string }) {
  const borders: Record<string, string> = { green: "border-l-[#3fb950]", yellow: "border-l-[#d2991d]", blue: "border-l-[#58a6ff]", purple: "border-l-[#a371f7]" };
  return (
    <div className={`bg-[#161b22] border border-[#30363d] rounded-xl p-6 border-l-2 ${borders[color] || borders.blue}`}>
      <h3 className="text-sm font-semibold text-[#c9d1d9] mb-4 flex items-center gap-2"><span>{icon}</span>{title}</h3>
      {children}
    </div>
  );
}

function WordStudy({ text }: { text: string }) {
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [strongsData, setStrongsData] = useState<{ ref: string; language: string; lemma: string; strongs_def: string; kjv_def: string; derivation: string; xlit?: string; pron?: string; } | null>(null);
  const [loadingRef, setLoadingRef] = useState<string | null>(null);
  const segments = text.split(/([GH]\d{1,4})/gi);

  const handleStrongsClick = async (ref: string) => {
    const normalized = ref.toUpperCase();
    if (activeRef === normalized) { setActiveRef(null); return; }
    setActiveRef(normalized); setLoadingRef(normalized);
    try { const res = await fetch(`/api/strongs?ref=${normalized}`); if (res.ok) setStrongsData(await res.json()); }
    catch {} finally { setLoadingRef(null); }
  };

  return (
    <div className="bg-[rgba(210,153,29,0.06)] border border-[rgba(210,153,29,0.15)] rounded-md px-3 py-2 mb-3">
      <p className="text-[#d2991d] text-xs font-semibold mb-1">🔤 Word Study</p>
      <p className="text-[#8b949e] text-xs leading-relaxed">
        {segments.map((seg, i) => {
          const isRef = /^[GH]\d{1,4}$/i.test(seg);
          return isRef ? (
            <button key={i} className="text-[#d2991d] font-mono hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); handleStrongsClick(seg); }}>
              {seg}
              {loadingRef === seg.toUpperCase() && <span className="ml-1 animate-pulse">...</span>}
            </button>
          ) : <span key={i}>{seg}</span>;
        })}
      </p>
      {activeRef && strongsData && strongsData.ref === activeRef && (
        <div className="mt-2 pt-2 border-t border-[rgba(210,153,29,0.15)] text-xs text-[#8b949e] space-y-1">
          <p><span className="text-[#d2991d] font-semibold">{strongsData.ref}</span> {strongsData.language} · {strongsData.xlit || strongsData.lemma}</p>
          <p><span className="font-semibold">KJV:</span> {strongsData.kjv_def}</p>
          <p><span className="font-semibold">Strong's:</span> {strongsData.strongs_def}</p>
        </div>
      )}
    </div>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────

function Spinner() {
  return <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <div className="h-4 bg-[#21262d] rounded w-1/3 mb-4" />
          <div className="space-y-3"><div className="h-3 bg-[#21262d] rounded w-full" /><div className="h-3 bg-[#21262d] rounded w-5/6" /><div className="h-3 bg-[#21262d] rounded w-4/6" /></div>
        </div>
      ))}
    </div>
  );
}
