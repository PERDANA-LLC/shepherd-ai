"use client";

import { STUDY_TYPES, type StudyTypeId } from "@/lib/study-types";

// ── Reusable Card (same visual style as main app) ─────────

function Card({ icon, title, color, children }: {
  icon: string; title: string; color: "green" | "yellow" | "blue" | "purple";
  children: React.ReactNode;
}) {
  const borders: Record<string, string> = {
    green: "border-l-[#3fb950]",
    yellow: "border-l-[#d2991d]",
    blue: "border-l-[#58a6ff]",
    purple: "border-l-[#a371f7]",
  };
  return (
    <div className={`bg-[#161b22] border border-[#30363d] ${borders[color]} border-l-4 rounded-xl p-5`}>
      <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

const ICONS = ["📌", "📖", "🔍", "🧠", "⚡", "🙏", "🎯", "⚠️", "📊", "🔑", "💡", "🛠️", "📋", "🏺", "🔮", "🛡️", "🕯️", "📜", "👤", "🧵"];
const COLORS = ["blue", "green", "yellow", "purple"] as const;

function fieldMeta(index: number) {
  return {
    icon: ICONS[index % ICONS.length],
    color: COLORS[index % COLORS.length],
  };
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Recursive Value Renderer ─────────────────────────────

function RenderValue({ value, depth = 0 }: { value: any; depth?: number }): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-[#484f58] italic">—</span>;
  }

  // String
  if (typeof value === "string") {
    return (
      <p className={depth === 0
        ? "text-[#c9d1d9] font-medium"
        : "text-[#8b949e] leading-relaxed whitespace-pre-line"
      }>
        {value}
      </p>
    );
  }

  // String array
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-[#484f58] italic">None</span>;
    }
    if (typeof value[0] === "string") {
      return (
        <ul className="space-y-2">
          {(value as string[]).map((item, i) => (
            <li key={i} className="flex gap-2 text-[#8b949e] text-sm">
              <span className="text-[#58a6ff] font-bold">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Object array
    if (typeof value[0] === "object") {
      return (
        <div className="space-y-3">
          {(value as Record<string, any>[]).map((obj, i) => (
            <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-sm">
              {Object.entries(obj).map(([k, v]) => (
                <div key={k} className="mb-1.5 last:mb-0">
                  <span className="text-[#c9d1d9] font-semibold text-xs">{formatKey(k)}:</span>{" "}
                  <RenderValue value={v} depth={depth + 1} />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-[#8b949e]">{JSON.stringify(value)}</span>;
  }

  // Object
  if (typeof value === "object") {
    return (
      <div className="space-y-2 text-sm">
        {(Object.entries(value) as [string, any][]).map(([k, v]) => (
          <div key={k}>
            <span className="text-[#c9d1d9] font-semibold text-xs">{formatKey(k)}:</span>{" "}
            <RenderValue value={v} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-[#8b949e]">{String(value)}</span>;
}

// ── Main Component ───────────────────────────────────────

export default function StudyTypeRenderer({
  study,
  studyType,
  level,
}: {
  study: any;
  studyType: StudyTypeId;
  level: number;
}) {
  if (!study || typeof study !== "object") {
    return <p className="text-[#8b949e] text-center py-8">No study data to display.</p>;
  }

  // Ignore metadata keys — only render study content keys
  const metaKeys = new Set(["passage_reference", "passage_text", "level", "level_name", "parse_error", "raw_study", "topic", "chapter", "name", "passage"]);
  const studyKeys = Object.keys(study).filter((k) => !metaKeys.has(k));

  if (studyKeys.length === 0) {
    // Legacy fallback — render everything
    return (
      <div className="space-y-4">
        {Object.entries(study).filter(([k]) => !["passage_reference", "passage_text", "level", "level_name"].includes(k)).map(([key, value], idx) => {
          const meta = fieldMeta(idx);
          return (
            <Card key={key} icon={meta.icon} title={formatKey(key)} color={meta.color}>
              <RenderValue value={value} />
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {studyKeys.map((key, idx) => {
        const value = study[key];
        if (value === undefined) return null;
        const meta = fieldMeta(idx);
        return (
          <Card key={key} icon={meta.icon} title={formatKey(key)} color={meta.color}>
            <RenderValue value={value} />
          </Card>
        );
      })}
    </div>
  );
}
