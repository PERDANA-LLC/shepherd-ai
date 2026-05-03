"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { downloadStudyPDF } from "@/lib/pdf";
import { FOCUS_MODES, type FocusMode } from "@/lib/theological-root";

// ── Types (shared with landing page) ───────────────────────────────

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

interface L1MemoryVerse { verse: string; text: string; hand_motion: string; }
interface L1Study {
  passage_reference: string; passage_text: string; level: 1; level_name: string;
  big_idea: string; memory_verse: L1MemoryVerse; picture_this: string;
  think_about_it: string[]; try_this: string; talk_to_god: string; show_someone: string;
}
interface L2Verse { verse: string; text: string; context: string; }
interface L2Study {
  passage_reference: string; passage_text: string; level: 2; level_name: string;
  the_hook: string; the_text: L2Verse[]; what_it_really_means: string;
  the_clash: string; your_turn: string[]; this_week: string; prayer: string;
}
interface L3WordStudy { word: string; strongs: string; definition: string; semantic_range: string; other_uses: string[]; }
interface L3InterpretiveOption { view: string; description: string; strength: string; weakness: string; }
interface L3Pitfall { misunderstanding: string; consequence: string; corrective_verse: string; }
interface L3Study {
  passage_reference: string; passage_text: string; level: 3; level_name: string;
  thesis_statement: string;
  text_and_context: { historical_background: string; literary_context: string; authorial_intent: string };
  word_study: L3WordStudy; interpretive_options: L3InterpretiveOption[];
  reformed_view: string; theological_pitfalls: L3Pitfall;
  discussion_questions: string[]; research_assignment: string; teach_it: string;
}
interface L4Exegesis { verse: string; greek_or_hebrew: string; parsing: string; syntax: string; textual_variants?: string; lxx_background?: string; }
interface L4Philology { word: string; etymology: string; cognates: string; diachronic_development: string; synchronic_usage: string; dictionary_entries: string; }
interface L4Debate { position: string; scholar: string; argument: string; presuppositions: string; }
interface L4Bibliography { source: string; type: string; annotation: string; }
interface L4Systematic { locus: string; explanation: string; }
interface L4Sermon { titles: string[]; outline: string; tough_questions: string[]; }
interface L4Study {
  passage_reference: string; passage_text: string; level: 4; level_name: string;
  research_question: string; exegetical_analysis: L4Exegesis[];
  philological_deep_dive: L4Philology; scholarly_debate: L4Debate[];
  reformed_position: string; pastoral_note: string;
  annotated_bibliography: L4Bibliography[]; systematic_theology_connection: L4Systematic;
  sermon_prep: L4Sermon; original_contribution: string; research_plan: string;
}
interface LegacyVerse { verse: string; text: string; explanation: string; cross_references: string[]; word_study?: string; }
interface LegacyStudy {
  passage_reference: string; passage_text: string;
  historical_context?: string; verse_breakdown?: LegacyVerse[];
  key_themes?: string[]; application_questions?: string[]; prayer_prompt?: string;
}
type StudyData = L1Study | L2Study | L3Study | L4Study | LegacyStudy;
interface StudyResponse { success: boolean; reference: string; translation: string; level?: number; level_name?: string; study: StudyData; }
interface HistoryEntry { id: string; reference: string; date: string; study: StudyResponse; }

interface Recommendation {
  tier: "beginner" | "intermediate" | "expert";
  label: string;
  description: string;
  action: string;
  next_passage?: string;
  reason: string;
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
  const history = loadHistory().filter(h => h.reference !== study.reference);
  history.unshift({ id: Date.now().toString(36), reference: study.reference, date: new Date().toLocaleString(), study });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}
function clearHistory(): void { localStorage.removeItem(HISTORY_KEY); }

// ── UI Components ──────────────────────────────────────────────────

function Spinner() {
  return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}

function Skeleton() {
  return <div className="space-y-4 animate-pulse">
    {[...Array(5)].map((_,i) => <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6"><div className="h-4 bg-[#21262d] rounded w-1/3 mb-3"/><div className="h-3 bg-[#21262d] rounded w-full mb-2"/><div className="h-3 bg-[#21262d] rounded w-5/6"/></div>)}
  </div>;
}

function LevelBadge({ level }: { level: number }) {
  const colors: Record<number, string> = { 1: "bg-[rgba(63,185,80,0.12)] border-[rgba(63,185,80,0.3)] text-[#3fb950]", 2: "bg-[rgba(210,153,29,0.12)] border-[rgba(210,153,29,0.3)] text-[#d2991d]", 3: "bg-[rgba(88,166,255,0.12)] border-[rgba(88,166,255,0.3)] text-[#58a6ff]", 4: "bg-[rgba(163,113,247,0.12)] border-[rgba(163,113,247,0.3)] text-[#a371f7]" };
  const emojis = ["", "🟢", "🟡", "🔵", "🔴"];
  const names = ["", "5th Grade", "High School", "College", "PhD"];
  return <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${colors[level]}`}>{emojis[level]} {names[level]}</span>;
}

function Card({ icon, title, color, children }: { icon: string; title: string; color: "green"|"yellow"|"blue"|"purple"; children: React.ReactNode }) {
  const borders: Record<string, string> = { green: "border-l-[#3fb950]", yellow: "border-l-[#d2991d]", blue: "border-l-[#58a6ff]", purple: "border-l-[#a371f7]" };
  return <div className={`bg-[#161b22] border border-[#30363d] ${borders[color]} border-l-4 rounded-xl p-5`}>
    <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3 flex items-center gap-2">{icon} {title}</h3>
    {children}
  </div>;
}

// ── Level Renderers ────────────────────────────────────────────────

function L1Result({ study: s }: { study: L1Study }) {
  return <div className="space-y-4">
    <Card icon="📌" title="The Big Idea" color="green"><p className="text-lg font-semibold text-[#c9d1d9]">{s.big_idea}</p></Card>
    <Card icon="📖" title="Memory Verse" color="green"><p className="text-[#3fb950] font-mono font-bold text-sm mb-1">{s.memory_verse.verse}</p><p className="text-[#c9d1d9] italic text-sm mb-2">{s.memory_verse.text}</p><p className="text-[#8b949e] text-sm">🖐️ {s.memory_verse.hand_motion}</p></Card>
    <Card icon="🎨" title="Picture This" color="green"><p className="text-[#8b949e] leading-relaxed">{s.picture_this}</p></Card>
    <Card icon="❓" title="Think About It" color="green"><ul className="space-y-2">{s.think_about_it?.map((q,i)=><li key={i} className="flex gap-2 text-[#8b949e]"><span className="text-[#3fb950] font-bold">{i+1}.</span><span>{q}</span></li>)}</ul></Card>
    <Card icon="🎮" title="Try This" color="green"><p className="text-[#8b949e] leading-relaxed">{s.try_this}</p></Card>
    <Card icon="🙏" title="Talk to God" color="green"><p className="text-[#8b949e] leading-relaxed italic">{s.talk_to_god}</p></Card>
    <Card icon="⭐" title="Show Someone" color="green"><p className="text-[#8b949e] leading-relaxed">{s.show_someone}</p></Card>
  </div>;
}

function L2Result({ study: s }: { study: L2Study }) {
  return <div className="space-y-4">
    <Card icon="🎬" title="The Hook" color="yellow"><p className="text-[#8b949e] leading-relaxed">{s.the_hook}</p></Card>
    <Card icon="📖" title="The Text" color="yellow"><div className="space-y-4">{s.the_text?.map((v,i)=><div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4"><p className="text-[#d2991d] font-mono font-bold text-sm mb-1">{v.verse}</p><p className="text-[#c9d1d9] italic text-sm mb-2">{v.text}</p><p className="text-[#8b949e] text-sm">{v.context}</p></div>)}</div></Card>
    <Card icon="🔍" title="What It Really Means" color="yellow"><p className="text-[#8b949e] leading-relaxed">{s.what_it_really_means}</p></Card>
    <Card icon="⚡" title="The Clash" color="yellow"><p className="text-[#8b949e] leading-relaxed">{s.the_clash}</p></Card>
    <Card icon="🧠" title="Your Turn" color="yellow"><ul className="space-y-2">{s.your_turn?.map((q,i)=><li key={i} className="flex gap-2 text-[#8b949e]"><span className="text-[#d2991d] font-bold">{i+1}.</span><span>{q}</span></li>)}</ul></Card>
    <Card icon="🛠️" title="This Week" color="yellow"><p className="text-[#8b949e] leading-relaxed">{s.this_week}</p></Card>
    <Card icon="🙏" title="Prayer" color="yellow"><p className="text-[#8b949e] leading-relaxed italic">{s.prayer}</p></Card>
  </div>;
}

function L3Result({ study: s }: { study: L3Study }) {
  return <div className="space-y-4">
    <Card icon="📌" title="Thesis Statement" color="blue"><p className="text-[#c9d1d9] font-medium">{s.thesis_statement}</p></Card>
    <Card icon="📖" title="Text & Context" color="blue"><div className="space-y-3 text-sm text-[#8b949e]"><div><span className="text-[#58a6ff] font-semibold">Historical Background:</span> {s.text_and_context?.historical_background}</div><div><span className="text-[#58a6ff] font-semibold">Literary Context:</span> {s.text_and_context?.literary_context}</div><div><span className="text-[#58a6ff] font-semibold">Authorial Intent:</span> {s.text_and_context?.authorial_intent}</div></div></Card>
    <Card icon="🔤" title="Word Study" color="blue"><div className="text-sm text-[#8b949e] space-y-1"><p><span className="text-[#58a6ff] font-mono font-bold">{s.word_study?.word}</span> <span className="text-[#484f58]">({s.word_study?.strongs})</span></p><p><span className="font-semibold">Definition:</span> {s.word_study?.definition}</p><p><span className="font-semibold">Semantic Range:</span> {s.word_study?.semantic_range}</p>{s.word_study?.other_uses?.length>0&&<div><span className="font-semibold">Other Uses:</span><ul className="list-disc pl-5 mt-1 space-y-0.5">{s.word_study.other_uses.map((u,i)=><li key={i}>{u}</li>)}</ul></div>}</div></Card>
    <Card icon="📊" title="Interpretive Options" color="blue"><div className="space-y-3">{s.interpretive_options?.map((opt,i)=><div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm"><p className="text-[#58a6ff] font-semibold mb-1">{opt.view}</p><p className="text-[#8b949e] mb-2">{opt.description}</p><div className="flex gap-4 text-xs"><span className="text-[#3fb950]">✓ {opt.strength}</span><span className="text-[#d2991d]">⚠ {opt.weakness}</span></div></div>)}{s.reformed_view&&<div className="bg-[rgba(88,166,255,0.06)] border border-[rgba(88,166,255,0.15)] rounded-lg p-3 text-sm"><span className="text-[#58a6ff] font-semibold">Reformed View:</span> <span className="text-[#8b949e]">{s.reformed_view}</span></div>}</div></Card>
    <Card icon="⚠️" title="Theological Pitfalls" color="blue"><div className="text-sm text-[#8b949e] space-y-2"><p><span className="font-semibold">Misunderstanding:</span> {s.theological_pitfalls?.misunderstanding}</p><p><span className="font-semibold">Consequence:</span> {s.theological_pitfalls?.consequence}</p><p className="text-[#58a6ff] font-mono">{s.theological_pitfalls?.corrective_verse}</p></div></Card>
    <Card icon="❓" title="Discussion Questions" color="blue"><ul className="space-y-2">{s.discussion_questions?.map((q,i)=><li key={i} className="flex gap-2 text-[#8b949e] text-sm"><span className="text-[#58a6ff] font-bold">{i+1}.</span><span>{q}</span></li>)}</ul></Card>
    <Card icon="🎓" title="Research Assignment" color="blue"><p className="text-[#8b949e] text-sm leading-relaxed">{s.research_assignment}</p></Card>
    <Card icon="🎯" title="Teach It" color="blue"><p className="text-[#8b949e] text-sm leading-relaxed whitespace-pre-line">{s.teach_it}</p></Card>
  </div>;
}

function L4Result({ study: s }: { study: L4Study }) {
  return <div className="space-y-4">
    <Card icon="🔬" title="Research Question" color="purple"><p className="text-[#c9d1d9] font-medium">{s.research_question}</p></Card>
    <Card icon="📖" title="Exegetical Analysis" color="purple"><div className="space-y-4">{s.exegetical_analysis?.map((v,i)=><div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm"><p className="text-[#a371f7] font-mono font-bold mb-2">{v.verse}</p><p className="text-[#8b949e] mb-1"><span className="text-[#c9d1d9] font-semibold">Greek/Hebrew:</span> {v.greek_or_hebrew}</p><p className="text-[#8b949e] mb-1"><span className="text-[#c9d1d9] font-semibold">Parsing:</span> {v.parsing}</p><p className="text-[#8b949e] mb-1"><span className="text-[#c9d1d9] font-semibold">Syntax:</span> {v.syntax}</p>{v.textual_variants&&<p className="text-[#8b949e] mb-1"><span className="text-[#c9d1d9] font-semibold">Textual Variants:</span> {v.textual_variants}</p>}{v.lxx_background&&<p className="text-[#8b949e]"><span className="text-[#c9d1d9] font-semibold">LXX Background:</span> {v.lxx_background}</p>}</div>)}</div></Card>
    <Card icon="🔤" title="Philological Deep Dive" color="purple"><div className="text-sm text-[#8b949e] space-y-1"><p><span className="text-[#a371f7] font-mono font-bold">{s.philological_deep_dive?.word}</span></p><p><span className="font-semibold">Etymology:</span> {s.philological_deep_dive?.etymology}</p><p><span className="font-semibold">Cognates:</span> {s.philological_deep_dive?.cognates}</p><p><span className="font-semibold">Diachronic:</span> {s.philological_deep_dive?.diachronic_development}</p><p><span className="font-semibold">Synchronic:</span> {s.philological_deep_dive?.synchronic_usage}</p><p><span className="font-semibold">Dictionaries:</span> {s.philological_deep_dive?.dictionary_entries}</p></div></Card>
    <Card icon="⚔️" title="Scholarly Debate" color="purple"><div className="space-y-4">{s.scholarly_debate?.map((d,i)=><div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm"><p className="text-[#a371f7] font-semibold mb-1">{d.position} <span className="text-[#8b949e] font-normal">— {d.scholar}</span></p><p className="text-[#8b949e] mb-2">{d.argument}</p><p className="text-[#8b949e]"><span className="text-[#c9d1d9] font-semibold">Presuppositions:</span> {d.presuppositions}</p></div>)}</div></Card>
    <Card icon="🏛️" title="Reformed Position" color="purple"><p className="text-[#8b949e] text-sm leading-relaxed">{s.reformed_position}</p></Card>
    <Card icon="💬" title="Pastoral Note" color="purple"><p className="text-[#8b949e] text-sm leading-relaxed">{s.pastoral_note}</p></Card>
    <Card icon="📚" title="Annotated Bibliography" color="purple"><div className="space-y-3">{s.annotated_bibliography?.map((b,i)=><div key={i} className="text-sm"><p className="text-[#a371f7] font-medium">{b.source} <span className="text-[#8b949e] font-normal text-xs">({b.type})</span></p><p className="text-[#8b949e] mt-0.5">{b.annotation}</p></div>)}</div></Card>
    <Card icon="📐" title="Systematic Theology" color="purple"><div className="text-sm"><p className="text-[#a371f7] font-semibold mb-1">{s.systematic_theology_connection?.locus}</p><p className="text-[#8b949e]">{s.systematic_theology_connection?.explanation}</p></div></Card>
    <Card icon="🎤" title="Sermon Prep" color="purple"><div className="text-sm space-y-3"><div><span className="font-semibold text-[#c9d1d9]">Titles:</span><ul className="list-disc pl-5 mt-1 space-y-0.5 text-[#8b949e]">{s.sermon_prep?.titles?.map((t,i)=><li key={i}>{t}</li>)}</ul></div><p className="text-[#8b949e] whitespace-pre-line"><span className="font-semibold text-[#c9d1d9]">Outline:</span> {s.sermon_prep?.outline}</p><div><span className="font-semibold text-[#c9d1d9]">Tough Questions:</span><ul className="list-disc pl-5 mt-1 space-y-0.5 text-[#8b949e]">{s.sermon_prep?.tough_questions?.map((q,i)=><li key={i}>{q}</li>)}</ul></div></div></Card>
    <Card icon="🧪" title="Original Contribution" color="purple"><p className="text-[#8b949e] text-sm leading-relaxed">{s.original_contribution}</p></Card>
    <Card icon="🗓️" title="30-Day Research Plan" color="purple"><p className="text-[#8b949e] text-sm leading-relaxed whitespace-pre-line">{s.research_plan}</p></Card>
  </div>;
}

function LegacyResult({ study: s }: { study: LegacyStudy }) {
  return <div className="space-y-4">
    {s.historical_context && <Card icon="📜" title="Historical Context" color="blue"><p className="text-[#8b949e] leading-relaxed">{s.historical_context}</p></Card>}
    {s.verse_breakdown && <Card icon="📖" title="Verse Breakdown" color="blue"><div className="space-y-3">{s.verse_breakdown.map((v,i)=><div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm"><p className="text-[#58a6ff] font-mono font-bold mb-1">{v.verse}</p><p className="text-[#c9d1d9] italic mb-2">{v.text}</p><p className="text-[#8b949e]">{v.explanation}</p>{v.cross_references?.length>0&&<p className="text-[#d2991d] text-xs mt-2">Cross-refs: {v.cross_references.join(", ")}</p>}{v.word_study&&<p className="text-[#3fb950] text-xs mt-1">🔤 {v.word_study}</p>}</div>)}</div></Card>}
    {s.key_themes && <Card icon="🔑" title="Key Themes" color="blue"><ul className="space-y-1">{s.key_themes.map((t,i)=><li key={i} className="text-[#8b949e] text-sm flex gap-2"><span className="text-[#58a6ff]">▸</span> {t}</li>)}</ul></Card>}
    {s.application_questions && <Card icon="❓" title="Application Questions" color="blue"><ul className="space-y-2">{s.application_questions.map((q,i)=><li key={i} className="flex gap-2 text-[#8b949e] text-sm"><span className="text-[#58a6ff] font-bold">{i+1}.</span><span>{q}</span></li>)}</ul></Card>}
    {s.prayer_prompt && <Card icon="🙏" title="Prayer" color="blue"><p className="text-[#8b949e] leading-relaxed italic">{s.prayer_prompt}</p></Card>}
  </div>;
}

function LevelResult({ study, level }: { study: any; level: number }) {
  switch (level) { case 1: return <L1Result study={study} />; case 2: return <L2Result study={study} />; case 3: return <L3Result study={study} />; case 4: return <L4Result study={study} />; default: return <LegacyResult study={study} />; }
}

// ── Main App Page ──────────────────────────────────────────────────

export default function AppPage() {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const [passage, setPassage] = useState("");
  const [level, setLevel] = useState<StudyLevel>(3);
  const [focus, setFocus] = useState<FocusMode>("christological");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [study, setStudy] = useState<StudyResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const [selectedRec, setSelectedRec] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Load profile + history from Supabase on mount
  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token || !userId) return;

      // Auto-create/get profile
      try {
        const pRes = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          setProfile(pData.profile);
        }
      } catch { /* silent */ }

      // Load history from Supabase
      try {
        const hRes = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (hRes.ok) {
          const hData = await hRes.json();
          if (hData.studies?.length > 0) {
            const supabaseHistory: HistoryEntry[] = hData.studies.map((s: any) => ({
              id: s.id,
              reference: s.passage,
              date: new Date(s.created_at).toLocaleString(),
              study: {
                success: true,
                reference: s.passage,
                translation: "King James Version (local)",
                level: s.level,
                level_name: `Level ${s.level}`,
                study: s.content,
              },
            }));
            setHistory(supabaseHistory);
          }
        }
      } catch { /* silent */ }

      // Fallback: load localStorage if Supabase is empty
      const local = loadHistory();
      if (local.length > 0 && history.length === 0) {
        setHistory(local);
      }
    }
    if (userId) load();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage.trim()) return;
    setLoading(true); setError(""); setStudy(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120_000);
      const res = await fetch("/api/study", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passage: passage.trim(), level, focus }), signal: controller.signal });
      clearTimeout(timeoutId);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { setError("The server returned an unexpected response."); return; }
      if (!res.ok) { setError(data.error || `Server error (${res.status}).`); }
      else {
        setStudy(data);
        saveToHistory(data);
        setHistory(loadHistory());
        // Save to Supabase
        try {
          const token = await getToken();
          if (token) {
            await fetch("/api/history", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                passage: data.reference,
                level: data.level,
                level_name: data.level_name,
                content: data.study,
                christological_root: (data.study as any).christological_root || null,
                title: (data.study as any).title || null,
              }),
            });
          }
        } catch { /* silent — localStorage still works */ }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") setError("Study took too long. Try a shorter passage.");
      else setError("Could not connect. Check your internet.");
    } finally { setLoading(false); }
  };

  const fetchRecommendations = async () => {
    if (!study) return;
    setRecsLoading(true); setRecError(""); setRecommendations([]); setSelectedRec(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage: study.reference, level: study.level || 3, context: "study_complete" }),
      });
      const data = await res.json();
      if (!res.ok) { setRecError(data.error || "Could not load recommendations."); }
      else { setRecommendations(data.recommendations || []); }
    } catch { setRecError("Could not connect to recommendation engine."); }
    finally { setRecsLoading(false); }
  };

  const acceptRecommendation = async (rec: Recommendation) => {
    setSelectedRec(rec.tier);
    try {
      await fetch("/api/recommend/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: study?.reference,
          level: study?.level,
          tier: rec.tier,
          label: rec.label,
          action: rec.action,
          next_passage: rec.next_passage,
          reason: rec.reason,
        }),
      });
    } catch { /* silent — journaled locally even if DB fails */ }
  };

  return (
    <div>
      {/* ── Dashboard widgets ── */}
      {!loading && (
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">🐑</span>
              <div>
                <p className="text-[#c9d1d9] text-sm font-semibold">Welcome{user?.firstName ? `, ${user.firstName}` : ""}</p>
                <p className="text-[#8b949e] text-xs">{profile?.study_level ? `Level ${profile.study_level}` : "Start your journey"}</p>
              </div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
              <p className="text-xs text-[#8b949e] mb-2">Quick Actions</p>
              <div className="flex gap-2">
                <a href="/app/assess" className="text-xs px-3 py-1.5 bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] rounded-lg transition-all">📊 Assess</a>
                <a href="/app/journal" className="text-xs px-3 py-1.5 bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] rounded-lg transition-all">📔 Journal</a>
                <span className="text-xs px-3 py-1.5 bg-[#21262d] border border-[#30363d] text-[#8b949e] rounded-lg">{history.length} studies</span>
              </div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
              <p className="text-xs text-[#8b949e] mb-2">This Session</p>
              <div className="flex gap-3 text-xs">
                <span className="text-[#58a6ff]">📖 {history.length} studies</span>
                <span className="text-[#3fb950]">{study ? "✅ Study ready" : "Start below →"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="text-center px-4 pt-12 pb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(88,166,255,0.08) 0%, transparent 70%)" }} />
        <div className="relative">
          <h2 className="text-2xl font-bold text-[#c9d1d9] mb-2">Study the Word</h2>
          <p className="text-[#8b949e] text-sm max-w-xl mx-auto mb-6">Enter any passage, choose your level, get a tailored KJV study.</p>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={passage} onChange={e => setPassage(e.target.value)} placeholder='Try "John 3:16" or "Romans 8:28-30"' className="flex-1 px-5 py-3.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] text-base placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all" disabled={loading} />
              <button type="submit" disabled={loading || !passage.trim()} className="px-6 py-3.5 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-semibold rounded-lg transition-all flex items-center gap-2">{loading ? <><Spinner /> Studying...</> : "Study →"}</button>
            </div>
            <div className="flex gap-1.5 justify-center">
              {LEVELS.map(l => <button key={l.level} type="button" onClick={() => setLevel(l.level)} disabled={loading}
                className={`text-xs px-3 py-2 rounded-lg border transition-all font-medium ${
                  level === l.level
                    ? l.level===1?"bg-[rgba(63,185,80,0.12)] border-[rgba(63,185,80,0.3)] text-[#3fb950]":l.level===2?"bg-[rgba(210,153,29,0.12)] border-[rgba(210,153,29,0.3)] text-[#d2991d]":l.level===3?"bg-[rgba(88,166,255,0.12)] border-[rgba(88,166,255,0.3)] text-[#58a6ff]":"bg-[rgba(163,113,247,0.12)] border-[rgba(163,113,247,0.3)] text-[#a371f7]"
                    : "bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#484f58]"}`}
                title={l.description}>{l.emoji} {l.name}</button>)}
            </div>
            <div className="flex gap-1.5 justify-center mt-2">
              {(Object.keys(FOCUS_MODES) as FocusMode[]).map(f => (
                <button key={f} type="button" onClick={() => setFocus(f)} disabled={loading}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    focus === f
                      ? "bg-[rgba(212,153,29,0.12)] border-[rgba(212,153,29,0.3)] text-[#d2991d]"
                      : "bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
                  }`}
                  title={FOCUS_MODES[f].description}>
                  {FOCUS_MODES[f].emoji} {FOCUS_MODES[f].label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </header>

      {error && <div className="max-w-2xl mx-auto px-4 mb-8"><div className="bg-[rgba(248,81,73,0.1)] border border-[rgba(248,81,73,0.3)] text-[#f85149] px-5 py-4 rounded-lg text-sm">{error}</div></div>}
      {loading && <div className="max-w-3xl mx-auto px-4 pb-16"><Skeleton /></div>}

      {study && !loading && (
        <main className="max-w-3xl mx-auto px-4 pb-20">
          <div className="space-y-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-[#c9d1d9]">{study.study.passage_reference}</h2>
                  {study.level && <LevelBadge level={study.level} />}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => downloadStudyPDF(study)} className="text-xs px-3 py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-lg font-medium transition-all">📄 PDF</button>
                  <button onClick={() => {
                    const shareText = `Study: ${study.study.passage_reference}\n\nKey insight from this passage...\n\n${study.study.passage_text?.slice(0, 200) || ''}`;
                    navigator.clipboard?.writeText(shareText).then(() => {
                      window.location.href = '/app/community?tab=share';
                    });
                  }} className="text-xs px-3 py-1.5 bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] rounded-lg font-medium transition-all">📤 Share</button>
                  <span className="text-xs px-3 py-1 bg-[#21262d] rounded-full text-[#8b949e] border border-[#30363d]">{study.translation}</span>
                </div>
              </div>
              <blockquote className="border-l-3 border-[#d2991d] pl-4 text-[#c9d1d9] leading-relaxed whitespace-pre-line italic">{study.study.passage_text}</blockquote>
            </div>
            <LevelResult study={study.study} level={study.level || 0} />

            {/* ── Recommendations Engine ── */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              {!recommendations.length && !recsLoading && !recError && (
                <button onClick={fetchRecommendations} className="w-full text-center py-4 text-[#58a6ff] hover:text-[#79c0ff] transition-colors">
                  <span className="text-lg mr-2">💡</span>
                  What should I study next?
                </button>
              )}
              {recsLoading && (
                <div className="text-center py-4">
                  <Spinner />
                  <p className="text-[#8b949e] text-sm mt-2">Generating recommendations...</p>
                </div>
              )}
              {recError && (
                <div className="text-center py-4">
                  <p className="text-[#f85149] text-sm">{recError}</p>
                  <button onClick={fetchRecommendations} className="text-[#58a6ff] text-xs mt-2 hover:underline">Try again</button>
                </div>
              )}
              {recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3 flex items-center gap-2">
                    💡 What's Next?
                    {selectedRec && <span className="text-[#3fb950] text-xs font-normal">— ✓ Action journaled</span>}
                  </h3>
                  <div className="grid gap-3">
                    {recommendations.map((rec) => {
                      const config = { beginner: { emoji: "🌱", color: "green", border: "border-l-[#3fb950]" }, intermediate: { emoji: "🌿", color: "blue", border: "border-l-[#58a6ff]" }, expert: { emoji: "🌳", color: "purple", border: "border-l-[#a371f7]" } }[rec.tier];
                      const isSelected = selectedRec === rec.tier;
                      return (
                        <div key={rec.tier}
                          className={`bg-[#0d1117] border ${isSelected ? config.border + " border-l-4 opacity-60" : "border-[#30363d]"} rounded-lg p-4 transition-all ${!selectedRec ? "cursor-pointer hover:border-[#58a6ff]/50" : ""}`}
                          onClick={() => !selectedRec && acceptRecommendation(rec)}>
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">{config.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold uppercase tracking-wide ${config.color === "green" ? "text-[#3fb950]" : config.color === "blue" ? "text-[#58a6ff]" : "text-[#a371f7]"}`}>{rec.tier}</span>
                                {isSelected && <span className="text-[#3fb950] text-xs">✓ Selected</span>}
                                {!selectedRec && <span className="text-[#484f58] text-xs">Click to journal</span>}
                              </div>
                              <p className="text-[#c9d1d9] text-sm font-medium mb-1">{rec.label}</p>
                              <p className="text-[#8b949e] text-xs leading-relaxed mb-2">{rec.description}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-[#58a6ff] font-medium">Action:</span>
                                <span className="text-[#c9d1d9]">{rec.action}</span>
                              </div>
                              {rec.next_passage && (
                                <p className="text-[#d2991d] text-xs mt-1 font-mono">📖 {rec.next_passage}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedRec && (
                    <button onClick={() => { setRecommendations([]); setSelectedRec(null); }}
                      className="w-full mt-3 text-xs text-[#8b949e] hover:text-[#c9d1d9] py-2 transition-colors">
                      Ask for new recommendations
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {!study && !loading && !error && (
        <div className="max-w-2xl mx-auto px-4 pb-20 text-center">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-[#8b949e]">Enter a passage above, choose your level, and begin.</p>
        </div>
      )}

      {showHistory && history.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#c9d1d9]">📋 Recent Studies</h3>
              <button onClick={async () => {
                clearHistory();
                setHistory([]);
                setShowHistory(false);
                // Clear Supabase too
                try {
                  const token = await getToken();
                  if (token) await fetch("/api/history", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                } catch {}
              }} className="text-xs px-2.5 py-1 bg-[#21262d] text-[#8b949e] hover:text-[#f85149] rounded-md border border-[#30363d] transition-all">Clear All</button>
            </div>
            <div className="space-y-2">
              {history.map(entry => (
                <button key={entry.id} onClick={() => { setStudy(entry.study); setError(""); setShowHistory(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="w-full text-left bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff] rounded-lg px-4 py-3 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[#58a6ff] font-medium text-sm group-hover:text-[#79c0ff]">{entry.reference}{entry.study.level_name && <span className="ml-2 text-[#484f58] text-xs">· {entry.study.level_name}</span>}</span>
                    <span className="text-[#484f58] text-xs">{entry.date}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
