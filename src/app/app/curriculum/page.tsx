"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CURRICULUM, type CurriculumModule } from "@/lib/curriculum";

// ── Spinner ──────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function CurriculumPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      // Load progress from localStorage for now
      try {
        const saved = localStorage.getItem("shepherd-curriculum-progress");
        if (saved) setCompletedModules(new Set(JSON.parse(saved)));
      } catch {}
      setLoading(false);
    }
  }, [isSignedIn]);

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

  const toggleModule = (moduleId: string) => {
    setCompletedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      localStorage.setItem(
        "shepherd-curriculum-progress",
        JSON.stringify([...next])
      );
      return next;
    });
  };

  const path = selectedPath
    ? CURRICULUM.find((p) => p.id === selectedPath)
    : null;

  const pathProgress = path
    ? path.modules.filter((m) => completedModules.has(m.id)).length
    : 0;

  // ── Path Selection View ──────────────────────────────────
  if (!selectedPath) {
    return (
      <div className="min-h-screen bg-[#0d1117] pt-8 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-[#c9d1d9] mb-2">📚 Curriculum Paths</h1>
            <p className="text-[#8b949e] text-sm max-w-lg mx-auto">
              Choose a structured learning path designed for your level. Each path guides you through Scripture with study modules you can complete at your own pace.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {CURRICULUM.map((path) => {
              const saved = localStorage.getItem("shepherd-curriculum-progress");
              let done = 0;
              if (saved) {
                const set = new Set(JSON.parse(saved));
                done = path.modules.filter((m) => set.has(m.id)).length;
              }
              const pct = path.modules.length > 0 ? Math.round((done / path.modules.length) * 100) : 0;

              return (
                <button
                  key={path.id}
                  onClick={() => setSelectedPath(path.id)}
                  className="text-left bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] rounded-xl p-6 transition-all group"
                >
                  <span className="text-3xl mb-3 block">{path.emoji}</span>
                  <h3 className="text-lg font-bold text-[#c9d1d9] group-hover:text-white mb-1">
                    {path.name}
                  </h3>
                  <p className="text-xs font-medium mb-2" style={{ color: path.color }}>
                    {path.subtitle} · {path.weeks > 0 ? `${path.weeks} modules` : "Ongoing"}
                  </p>
                  <p className="text-[#8b949e] text-sm leading-relaxed mb-4">
                    {path.description}
                  </p>
                  {done > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#8b949e]">Progress</span>
                        <span style={{ color: path.color }}>{done}/{path.modules.length}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: path.color }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Module List View ─────────────────────────────────────
  if (!path) return null;

  return (
    <div className="min-h-screen bg-[#0d1117] pt-8 px-4 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* Back + Header */}
        <button
          onClick={() => setSelectedPath(null)}
          className="text-[#8b949e] hover:text-[#c9d1d9] text-sm mb-4 transition-colors"
        >
          ← All Paths
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{path.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-[#c9d1d9]">{path.name}</h1>
            <p className="text-sm" style={{ color: path.color }}>
              {path.modules.length} modules · {path.weeks > 0 ? `${path.weeks} weeks` : "Self-paced"}
            </p>
          </div>
        </div>
        <p className="text-[#8b949e] text-sm mb-6">{path.description}</p>

        {/* Progress */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#c9d1d9] font-semibold">
              {pathProgress} / {path.modules.length} completed
            </span>
            <span className="text-xs" style={{ color: path.color }}>
              {path.modules.length > 0
                ? Math.round((pathProgress / path.modules.length) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${path.modules.length > 0 ? (pathProgress / path.modules.length) * 100 : 0}%`,
                backgroundColor: path.color,
              }}
            />
          </div>
          {pathProgress === path.modules.length && (
            <p className="text-[#3fb950] text-xs mt-2">🎉 All modules completed!</p>
          )}
        </div>

        {/* Module List */}
        <div className="space-y-3">
          {path.modules.map((mod, i) => {
            const isCompleted = completedModules.has(mod.id);
            const isNext =
              !isCompleted &&
              (i === 0 || completedModules.has(path.modules[i - 1].id));

            return (
              <ModuleCard
                key={mod.id}
                module={mod}
                isCompleted={isCompleted}
                isNext={isNext}
                color={path.color}
                onToggle={() => toggleModule(mod.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Module Card ────────────────────────────────────────────

function ModuleCard({
  module: mod,
  isCompleted,
  isNext,
  color,
  onToggle,
}: {
  module: CurriculumModule;
  isCompleted: boolean;
  isNext: boolean;
  color: string;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-[#161b22] border rounded-xl transition-all ${
        isCompleted
          ? "border-[#21262d] opacity-60"
          : isNext
          ? "border-[#58a6ff]/40"
          : "border-[#30363d]"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
            isCompleted
              ? "bg-[#3fb950] border-[#3fb950]"
              : "border-[#30363d] hover:border-[#484f58]"
          }`}
        >
          {isCompleted && <span className="text-white text-xs">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-[#484f58] font-mono">
              {mod.number}.
            </span>
            {isNext && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(88,166,255,0.12)] text-[#58a6ff] font-medium">
                NEXT
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-[#c9d1d9]">{mod.title}</h4>
          <p className="text-xs text-[#8b949e] mt-0.5">{mod.subtitle}</p>
        </div>

        <span className="text-[#484f58] text-sm">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#21262d] pt-4 space-y-4">
          {/* Passage + Study button */}
          <div className="flex items-center justify-between">
            <span className="text-xs px-2.5 py-1 bg-[#21262d] rounded-full text-[#58a6ff] font-mono">
              📖 {mod.passage}
            </span>
            <a
              href={`/app?passage=${encodeURIComponent(mod.passage)}`}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: `${color}15`,
                color: color,
                border: `1px solid ${color}30`,
              }}
            >
              Study This Passage →
            </a>
          </div>

          {/* Themes */}
          <div>
            <h5 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-2">
              Themes
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {mod.themes.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div>
            <h5 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-2">
              Objectives
            </h5>
            <ul className="space-y-1">
              {mod.objectives.map((o, i) => (
                <li key={i} className="text-xs text-[#8b949e] flex gap-2">
                  <span style={{ color: color }}>▸</span> {o}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Questions */}
          <div>
            <h5 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-2">
              Key Questions
            </h5>
            <ul className="space-y-1">
              {mod.key_questions.map((q, i) => (
                <li key={i} className="text-xs text-[#8b949e] flex gap-2">
                  <span className="text-[#d2991d]">?</span> {q}
                </li>
              ))}
            </ul>
          </div>

          {mod.memory_verse && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
              <span className="text-[10px] text-[#484f58] uppercase tracking-wide">
                Memory Verse
              </span>
              <p className="text-sm text-[#d2991d] font-mono mt-1">
                {mod.memory_verse}
              </p>
            </div>
          )}

          {/* Christological Connection */}
          <div className="bg-[rgba(212,153,29,0.05)] border border-[rgba(212,153,29,0.15)] rounded-lg p-3">
            <span className="text-[10px] text-[#d2991d] uppercase tracking-wide font-semibold">
              ✝️ Christological Connection
            </span>
            <p className="text-xs text-[#8b949e] mt-1 leading-relaxed">
              {mod.christological_connection}
            </p>
          </div>

          {/* Generate Workbook */}
          <a
            href={`/app/workbook?path=${mod.id}`}
            className="block text-center text-xs py-2 rounded-lg bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] transition-all"
          >
            📄 Generate Workbook for This Module
          </a>
        </div>
      )}
    </div>
  );
}
