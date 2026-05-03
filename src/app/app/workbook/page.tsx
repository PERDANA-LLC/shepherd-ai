"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";

// ── Types ─────────────────────────────────────────────────────

interface WorkbookSession {
  session: number;
  title: string;
  focus_verses: string;
  opening_prayer: string;
  read: string;
  observe: string[];
  interpret: string[];
  apply: string[];
  dig_deeper: string;
  memory_verse: string;
  closing_prayer: string;
}

interface Workbook {
  id?: string;
  passage: string;
  level: number;
  title: string;
  level_name?: string;
  introduction?: string;
  sessions: WorkbookSession[];
  christological_summary?: string;
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

export default function WorkbookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#58a6ff] border-t-transparent rounded-full" />
      </div>
    }>
      <WorkbookContent />
    </Suspense>
  );
}

function WorkbookContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [moduleId, setModuleId] = useState(searchParams.get("path") || "");
  const [passage, setPassage] = useState("");
  const [level, setLevel] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [activeSession, setActiveSession] = useState(0);
  const [error, setError] = useState("");
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      loadWorkbooks();
    }
  }, [isSignedIn]);

  const loadWorkbooks = async () => {
    try {
      const res = await fetch("/api/workbook");
      if (res.ok) {
        const data = await res.json();
        setWorkbooks(data.workbooks || []);
      }
    } catch {} finally {
      setLoadingList(false);
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

  const handleGenerate = async () => {
    if (!passage.trim() && !moduleId) return;
    setGenerating(true);
    setError("");
    setWorkbook(null);

    try {
      const res = await fetch("/api/workbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: moduleId || undefined,
          passage: passage.trim(),
          level,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed");
      } else {
        setWorkbook(data.workbook);
        setActiveSession(0);
        loadWorkbooks();
      }
    } catch {
      setError("Connection error");
    } finally {
      setGenerating(false);
    }
  };

  const handlePDF = () => {
    if (!workbook) return;
    downloadWorkbookPDF(workbook);
  };

  // ── Workbook view ─────────────────────────────────────────
  if (workbook) {
    const session = workbook.sessions?.[activeSession];

    return (
      <div className="min-h-screen bg-[#0d1117] pt-8 px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setWorkbook(null); setModuleId(""); setPassage(""); }}
            className="text-[#8b949e] hover:text-[#c9d1d9] text-sm mb-4 transition-colors"
          >
            ← New Workbook
          </button>

          {/* Header */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-[#c9d1d9]">{workbook.title}</h1>
                <p className="text-sm text-[#8b949e] mt-1">
                  📖 {workbook.passage} · {workbook.level_name || `Level ${workbook.level}`}
                </p>
              </div>
              <button
                onClick={handlePDF}
                className="px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm font-semibold rounded-lg transition-all"
              >
                📄 Export PDF
              </button>
            </div>

            {workbook.introduction && (
              <p className="text-[#8b949e] text-sm leading-relaxed italic">
                {workbook.introduction}
              </p>
            )}
          </div>

          {/* Session tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
            {workbook.sessions?.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSession(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  i === activeSession
                    ? "bg-[#1f6feb] text-white"
                    : "bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                Session {s.session}: {s.title}
              </button>
            ))}
          </div>

          {/* Session content */}
          {session && (
            <div className="space-y-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                <h2 className="text-lg font-bold text-[#c9d1d9] mb-2">
                  Session {session.session}: {session.title}
                </h2>
                <p className="text-xs text-[#58a6ff] font-mono">{session.focus_verses}</p>
              </div>

              {session.opening_prayer && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-2">🙏 Opening Prayer</h3>
                  <p className="text-[#c9d1d9] text-sm italic">{session.opening_prayer}</p>
                </div>
              )}

              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-2">📖 Read</h3>
                <p className="text-[#c9d1d9] text-sm">{session.read}</p>
              </div>

              {session.observe?.length > 0 && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">🔍 Observe</h3>
                  <div className="space-y-2">
                    {session.observe.map((q, i) => (
                      <div key={i} className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 text-sm text-[#c9d1d9]">
                        <span className="text-[#3fb950] font-bold mr-2">{i + 1}.</span>{q}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {session.interpret?.length > 0 && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">💡 Interpret</h3>
                  <div className="space-y-2">
                    {session.interpret.map((q, i) => (
                      <div key={i} className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 text-sm text-[#c9d1d9]">
                        <span className="text-[#58a6ff] font-bold mr-2">{i + 1}.</span>{q}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {session.apply?.length > 0 && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">🛠️ Apply</h3>
                  <div className="space-y-2">
                    {session.apply.map((q, i) => (
                      <div key={i} className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 text-sm text-[#c9d1d9]">
                        <span className="text-[#d2991d] font-bold mr-2">{i + 1}.</span>{q}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory Verse */}
              {session.memory_verse && (
                <div className="bg-[rgba(212,153,29,0.05)] border border-[rgba(212,153,29,0.15)] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#d2991d] uppercase tracking-wide mb-2">🎯 Memory Verse</h3>
                  <p className="text-[#d2991d] font-mono font-bold">{session.memory_verse}</p>
                </div>
              )}

              {/* Dig Deeper */}
              {session.dig_deeper && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-2">⛏️ Dig Deeper</h3>
                  <p className="text-[#8b949e] text-sm">{session.dig_deeper}</p>
                </div>
              )}

              {session.closing_prayer && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-2">🙏 Closing Prayer</h3>
                  <p className="text-[#c9d1d9] text-sm italic">{session.closing_prayer}</p>
                </div>
              )}
            </div>
          )}

          {/* Christological summary */}
          {workbook.christological_summary && (
            <div className="mt-6 bg-[rgba(163,113,247,0.05)] border border-[rgba(163,113,247,0.15)] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#a371f7] uppercase tracking-wide mb-2">✝️ Christological Summary</h3>
              <p className="text-[#8b949e] text-sm leading-relaxed">{workbook.christological_summary}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Generate form + workbook list ─────────────────────────
  return (
    <div className="min-h-screen bg-[#0d1117] pt-8 px-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#c9d1d9] mb-2">📄 Study Workbooks</h1>
        <p className="text-[#8b949e] text-sm mb-8">
          Generate multi-session study workbooks for any passage or curriculum module.
        </p>

        {/* Generation form */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-8 space-y-4">
          {!moduleId && (
            <div>
              <label className="text-xs text-[#8b949e] block mb-1">Passage</label>
              <input
                type="text"
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder="e.g. Romans 8"
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-[#8b949e] block mb-1">Level</label>
            <div className="flex gap-2">
              {[
                { l: 1, n: "5th Grade", e: "🟢" },
                { l: 2, n: "High School", e: "🟡" },
                { l: 3, n: "College", e: "🔵" },
                { l: 4, n: "PhD", e: "🔴" },
              ].map((opt) => (
                <button
                  key={opt.l}
                  type="button"
                  onClick={() => setLevel(opt.l)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    level === opt.l
                      ? "bg-[#1f6feb] text-white"
                      : "bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9]"
                  }`}
                >
                  {opt.e} {opt.n}
                </button>
              ))}
            </div>
          </div>

          {moduleId && (
            <div className="text-xs text-[#58a6ff] bg-[rgba(88,166,255,0.06)] border border-[rgba(88,166,255,0.12)] rounded-lg p-3">
              Using curriculum module: <span className="font-mono">{moduleId}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || (!passage.trim() && !moduleId)}
            className="w-full py-2.5 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {generating ? <><Spinner /> Generating 4-Session Workbook...</> : "Generate Workbook"}
          </button>

          {error && (
            <div className="p-3 bg-[rgba(248,81,73,0.1)] border border-[rgba(248,81,73,0.3)] text-[#f85149] rounded-lg text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Previous workbooks */}
        <div>
          <h2 className="text-sm font-semibold text-[#c9d1d9] mb-3">Previous Workbooks</h2>
          {loadingList ? (
            <div className="text-center py-6"><Spinner /></div>
          ) : workbooks.length === 0 ? (
            <p className="text-[#8b949e] text-sm text-center py-6">
              No workbooks yet. Generate your first one above.
            </p>
          ) : (
            <div className="space-y-2">
              {workbooks.map((wb: any) => (
                <button
                  key={wb.id}
                  onClick={() => setWorkbook({ ...wb.sessions, id: wb.id, title: wb.title, passage: wb.passage, level: wb.level, sessions: wb.sessions?.sessions || wb.sessions, introduction: wb.sessions?.introduction, christological_summary: wb.sessions?.christological_summary, level_name: wb.sessions?.level_name })}
                  className="w-full text-left bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] rounded-xl p-4 transition-all group"
                >
                  <p className="text-sm font-semibold text-[#c9d1d9] group-hover:text-white">
                    {wb.title}
                  </p>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    📖 {wb.passage} · Level {wb.level} · {new Date(wb.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PDF Export ──────────────────────────────────────────────────

function sanitize(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2600-\u27BF\uD83C\uD83D\uD83E][\uDC00-\uDFFF]?/g, "")
    .replace(/[\uFE00-\uFE0F]/g, "")
    .trim();
}

function downloadWorkbookPDF(wb: Workbook) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const MARGIN = 20;
  const W = doc.internal.pageSize.getWidth() - MARGIN * 2;
  let y = 25;

  function check() {
    if (y > 270) { doc.addPage(); y = MARGIN; }
  }

  function addText(text: string, opts: { size?: number; bold?: boolean; color?: string; font?: string } = {}) {
    const { size = 10, bold = false, color = "#333", font = "Helvetica" } = opts;
    check();
    doc.setFontSize(size);
    doc.setFont(font, bold ? "bold" : "normal");
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(sanitize(text), W);
    for (const line of lines) {
      check();
      doc.text(line, MARGIN, y);
      y += size * 0.42;
    }
    y += 3;
  }

  function addSection(title: string) {
    check();
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, y, MARGIN + W, y);
    y += 6;
    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor("#1a1a1a");
    doc.text(sanitize(title), MARGIN, y);
    y += 9;
  }

  // Title
  doc.setFontSize(18);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor("#0d47a1");
  doc.text(sanitize(wb.title), MARGIN, y); y += 10;
  doc.setFontSize(10);
  doc.setTextColor("#555");
  doc.text(`${wb.passage} · ${wb.level_name || `Level ${wb.level}`}`, MARGIN, y); y += 8;

  if (wb.introduction) {
    addText(wb.introduction, { size: 10, color: "#555" });
  }

  for (const session of wb.sessions) {
    addSection(`Session ${session.session}: ${session.title}`);
    addText(`Focus: ${session.focus_verses}`, { size: 9, bold: true, color: "#0d47a1" });
    if (session.opening_prayer) addText(`Opening Prayer: ${session.opening_prayer}`, { size: 9, color: "#555" });
    addText(`Read: ${session.read}`, { size: 9 });
    if (session.observe?.length) {
      addText("Observe:", { size: 9, bold: true });
      session.observe.forEach((q, i) => addText(`${i + 1}. ${q}`, { size: 9 }));
    }
    if (session.interpret?.length) {
      addText("Interpret:", { size: 9, bold: true });
      session.interpret.forEach((q, i) => addText(`${i + 1}. ${q}`, { size: 9 }));
    }
    if (session.apply?.length) {
      addText("Apply:", { size: 9, bold: true });
      session.apply.forEach((q, i) => addText(`${i + 1}. ${q}`, { size: 9 }));
    }
    if (session.dig_deeper) addText(`Dig Deeper: ${session.dig_deeper}`, { size: 9, color: "#555" });
    if (session.memory_verse) addText(`Memory Verse: ${session.memory_verse}`, { size: 9, bold: true, color: "#d2991d" });
    if (session.closing_prayer) addText(`Closing Prayer: ${session.closing_prayer}`, { size: 9, color: "#555" });
    y += 5;
  }

  if (wb.christological_summary) {
    addSection("Christological Summary");
    addText(wb.christological_summary, { size: 9, color: "#555" });
  }

  const filename = `Shepherd_AI_Workbook_${wb.passage.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
