"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────

interface JournalEntry {
  id: string;
  passage?: string;
  content: string;
  struggle?: string;
  gratitude?: string;
  prayer_request?: string;
  fruit_scores?: FruitScores;
  mood?: string;
  entry_date: string;
  created_at: string;
}

interface FruitScores {
  galatians?: Record<string, number>;
  james?: Record<string, number>;
}

const GALATIANS_FRUITS = [
  { key: "love", label: "Love", emoji: "❤️", verse: "Gal 5:22" },
  { key: "joy", label: "Joy", emoji: "😊", verse: "Gal 5:22" },
  { key: "peace", label: "Peace", emoji: "🕊️", verse: "Gal 5:22" },
  { key: "longsuffering", label: "Longsuffering", emoji: "⏳", verse: "Gal 5:22" },
  { key: "gentleness", label: "Gentleness", emoji: "🤝", verse: "Gal 5:22" },
  { key: "goodness", label: "Goodness", emoji: "✨", verse: "Gal 5:22" },
  { key: "faith", label: "Faith", emoji: "🙏", verse: "Gal 5:22" },
  { key: "meekness", label: "Meekness", emoji: "😌", verse: "Gal 5:23" },
  { key: "temperance", label: "Temperance", emoji: "🎯", verse: "Gal 5:23" },
];

const JAMES_FRUITS = [
  { key: "pure", label: "Pure", emoji: "✨", verse: "Jas 3:17" },
  { key: "peace", label: "Peaceable", emoji: "🕊️", verse: "Jas 3:17" },
  { key: "gentleness", label: "Gentle", emoji: "🤝", verse: "Jas 3:17" },
  { key: "easy_to_be_intreated", label: "Easy to be Intreated", emoji: "🤗", verse: "Jas 3:17" },
  { key: "full_of_mercy", label: "Full of Mercy", emoji: "💛", verse: "Jas 3:17" },
  { key: "goodness", label: "Good Fruits", emoji: "🌱", verse: "Jas 3:17" },
  { key: "without_partiality", label: "Without Partiality", emoji: "⚖️", verse: "Jas 3:17" },
  { key: "without_hypocrisy", label: "Without Hypocrisy", emoji: "🎭", verse: "Jas 3:17" },
];

const MOODS = ["😊", "🙏", "🤔", "😔", "😤", "😌", "🔥", "💪"];

// ── Spinner ────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Fruit Rating Component ─────────────────────────────────────

function FruitRater({
  fruits,
  title,
  framework,
  scores,
  onChange,
}: {
  fruits: typeof GALATIANS_FRUITS;
  title: string;
  framework: "galatians" | "james";
  scores: Record<string, number>;
  onChange: (framework: string, key: string, value: number) => void;
}) {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">
        {title}
      </h4>
      <div className="space-y-2">
        {fruits.map((fruit) => (
          <div key={fruit.key} className="flex items-center gap-3">
            <span className="text-sm w-6 text-center">{fruit.emoji}</span>
            <span className="text-sm text-[#c9d1d9] w-32 truncate">
              {fruit.label}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange(framework, fruit.key, val)}
                  className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${
                    (scores[fruit.key] || 0) >= val
                      ? "bg-[#1f6feb] text-white"
                      : "bg-[#21262d] text-[#484f58] hover:bg-[#30363d]"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────

export default function JournalPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeFramework, setActiveFramework] = useState<"galatians" | "james">("galatians");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [content, setContent] = useState("");
  const [passage, setPassage] = useState("");
  const [struggle, setStruggle] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [prayerRequest, setPrayerRequest] = useState("");
  const [mood, setMood] = useState("");
  const [fruitScores, setFruitScores] = useState<FruitScores>({
    galatians: {},
    james: {},
  });

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.journals || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) loadEntries();
  }, [isSignedIn, loadEntries]);

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

  const handleFruitChange = (
    framework: string,
    key: string,
    value: number
  ) => {
    setFruitScores((prev) => ({
      ...prev,
      [framework]: {
        ...(prev[framework as keyof FruitScores] || {}),
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          passage: passage.trim() || null,
          struggle: struggle.trim() || null,
          gratitude: gratitude.trim() || null,
          prayer_request: prayerRequest.trim() || null,
          mood: mood || null,
          fruit_scores: fruitScores,
        }),
      });

      if (res.ok) {
        // Reset form
        setContent("");
        setPassage("");
        setStruggle("");
        setGratitude("");
        setPrayerRequest("");
        setMood("");
        setFruitScores({ galatians: {}, james: {} });
        setShowForm(false);
        loadEntries();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      // silent
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] pt-8 px-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#c9d1d9]">📔 Journal</h1>
            <p className="text-[#8b949e] text-sm mt-1">
              {entries.length} entry{entries.length !== 1 ? "ies" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold rounded-lg transition-all text-sm"
          >
            {showForm ? "Cancel" : "+ New Entry"}
          </button>
        </div>

        {/* New Entry Form */}
        {showForm && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-8 space-y-4">
            {/* Passage */}
            <div>
              <label className="text-xs text-[#8b949e] block mb-1">
                Passage (optional)
              </label>
              <input
                type="text"
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder="e.g., John 3:16"
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>

            {/* Mood */}
            <div>
              <label className="text-xs text-[#8b949e] block mb-1">Mood</label>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(mood === m ? "" : m)}
                    className={`text-xl p-1.5 rounded-lg transition-all ${
                      mood === m
                        ? "bg-[rgba(88,166,255,0.15)] ring-1 ring-[#58a6ff]"
                        : "hover:bg-[#21262d]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Content */}
            <div>
              <label className="text-xs text-[#8b949e] block mb-1">
                Journal Entry *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you learn? How did God speak to you today?"
                rows={5}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] resize-y"
              />
            </div>

            {/* Struggle (Private) */}
            <div>
              <label className="text-xs text-[#8b949e] block mb-1">
                🔒 Struggle <span className="text-[#f85149]">(private — never shared)</span>
              </label>
              <textarea
                value={struggle}
                onChange={(e) => setStruggle(e.target.value)}
                placeholder="What are you struggling with?"
                rows={2}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] resize-y"
              />
            </div>

            {/* Gratitude */}
            <div>
              <label className="text-xs text-[#8b949e] block mb-1">
                Gratitude
              </label>
              <textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="What are you thankful for today?"
                rows={2}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] resize-y"
              />
            </div>

            {/* Prayer Request (Private) */}
            <div>
              <label className="text-xs text-[#8b949e] block mb-1">
                🔒 Prayer Request <span className="text-[#f85149]">(private)</span>
              </label>
              <textarea
                value={prayerRequest}
                onChange={(e) => setPrayerRequest(e.target.value)}
                placeholder="How can we pray for you?"
                rows={2}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] resize-y"
              />
            </div>

            {/* ── Fruit of the Spirit Tracker ── */}
            <div className="border-t border-[#30363d] pt-4">
              <h3 className="text-sm font-semibold text-[#c9d1d9] mb-4">
                🍇 Fruit of the Spirit Check
              </h3>

              {/* Framework tabs */}
              <div className="flex gap-1 mb-4">
                <button
                  onClick={() => setActiveFramework("galatians")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeFramework === "galatians"
                      ? "bg-[rgba(88,166,255,0.15)] text-[#58a6ff]"
                      : "text-[#8b949e] hover:text-[#c9d1d9]"
                  }`}
                >
                  Galatians 5:22-23 · Spirit
                </button>
                <button
                  onClick={() => setActiveFramework("james")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeFramework === "james"
                      ? "bg-[rgba(163,113,247,0.15)] text-[#a371f7]"
                      : "text-[#8b949e] hover:text-[#c9d1d9]"
                  }`}
                >
                  James 3:17-18 · Wisdom
                </button>
              </div>

              {activeFramework === "galatians" ? (
                <FruitRater
                  fruits={GALATIANS_FRUITS}
                  title="Fruit of the Spirit (Galatians 5:22-23)"
                  framework="galatians"
                  scores={fruitScores.galatians || {}}
                  onChange={handleFruitChange}
                />
              ) : (
                <FruitRater
                  fruits={JAMES_FRUITS}
                  title="Fruit of Heavenly Wisdom (James 3:17-18)"
                  framework="james"
                  scores={fruitScores.james || {}}
                  onChange={handleFruitChange}
                />
              )}
            </div>

            {/* Save button */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !content.trim()}
                className="flex-1 px-4 py-2.5 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                {saving ? <><Spinner /> Saving...</> : "Save Journal Entry"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="p-3 bg-[rgba(248,81,73,0.1)] border border-[rgba(248,81,73,0.3)] text-[#f85149] rounded-lg text-sm text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Entry List */}
        {loading ? (
          <div className="text-center py-12">
            <Spinner />
            <p className="text-[#8b949e] text-sm mt-3">Loading journals...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">📔</span>
            <p className="text-[#8b949e] text-sm mb-4">
              No journal entries yet. Start tracking your spiritual growth.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold rounded-lg transition-all text-sm"
            >
              Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#484f58] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#484f58]">
                        {new Date(entry.entry_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {entry.mood && (
                        <span className="text-sm">{entry.mood}</span>
                      )}
                      {entry.passage && (
                        <span className="text-xs px-2 py-0.5 bg-[#21262d] rounded-full text-[#58a6ff] font-mono">
                          {entry.passage}
                        </span>
                      )}
                    </div>
                    <p className="text-[#c9d1d9] text-sm leading-relaxed whitespace-pre-line">
                      {entry.content.length > 200
                        ? entry.content.slice(0, 200) + "..."
                        : entry.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-[#484f58] hover:text-[#f85149] transition-colors text-xs shrink-0 ml-2"
                    title="Delete entry"
                  >
                    ✕
                  </button>
                </div>

                {/* Fruit scores summary */}
                {entry.fruit_scores && (
                  <div className="mt-3 pt-3 border-t border-[#21262d]">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(entry.fruit_scores as Record<string, Record<string, number>>).map(
                        ([framework, scores]) =>
                          Object.entries(scores || {}).map(([key, val]) => (
                            <span
                              key={`${framework}-${key}`}
                              className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e]"
                              title={`${framework}: ${key} = ${val}/5`}
                            >
                              {val}/5
                            </span>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
