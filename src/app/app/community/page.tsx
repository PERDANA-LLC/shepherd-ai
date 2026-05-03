"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────

interface Share {
  id: string;
  user_id: string;
  display_name: string | null;
  share_type: "study" | "journal" | "testimony" | "prayer_request";
  title: string | null;
  content: string;
  passage: string | null;
  level: number | null;
  tags: string[];
  likes: number;
  created_at: string;
}

interface Testimony {
  id: string;
  author_name: string;
  title: string;
  story: string;
  passage: string | null;
  prayers: number;
  encouragements: number;
  created_at: string;
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

export default function CommunityPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"feed" | "testimonies" | "prayer" | "share">("feed");
  const [shares, setShares] = useState<Share[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  // Share form
  const [shareType, setShareType] = useState<"study" | "journal">("study");
  const [shareName, setShareName] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [shareContent, setShareContent] = useState("");
  const [sharePassage, setSharePassage] = useState("");
  const [shareAnon, setShareAnon] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);

  // Testimony form
  const [testName, setTestName] = useState("");
  const [testTitle, setTestTitle] = useState("");
  const [testStory, setTestStory] = useState("");
  const [testPassage, setTestPassage] = useState("");
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testError, setTestError] = useState("");
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      loadShares();
      loadTestimonies();
    }
  }, [isSignedIn]);

  const loadShares = async () => {
    try {
      const res = await fetch("/api/share");
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const loadTestimonies = async () => {
    try {
      const res = await fetch("/api/testimony");
      if (res.ok) {
        const data = await res.json();
        setTestimonies(data.testimonies || []);
      }
    } catch {}
  };

  if (!isLoaded || !isSignedIn) {
    if (!isLoaded) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center"><Spinner /></div>;
    router.push("/sign-in");
    return null;
  }

  const handleShare = async () => {
    if (!shareContent.trim()) return;
    setSharing(true);
    setShareError("");
    setShareSuccess(false);

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_type: shareType,
          title: shareTitle || null,
          content: shareContent,
          passage: sharePassage || null,
          display_name: shareAnon ? null : shareName || null,
        }),
      });
      if (res.ok) {
        setShareSuccess(true);
        setShareContent("");
        setShareTitle("");
        setSharePassage("");
        loadShares();
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        setShareError("Failed to share");
      }
    } catch {
      setShareError("Connection error");
    } finally {
      setSharing(false);
    }
  };

  const handleTestimony = async () => {
    if (!testTitle.trim() || !testStory.trim()) return;
    setTestSubmitting(true);
    setTestError("");
    setTestSuccess(false);

    try {
      const res = await fetch("/api/testimony", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: testName || "Anonymous",
          title: testTitle,
          story: testStory,
          passage: testPassage || null,
        }),
      });
      if (res.ok) {
        setTestSuccess(true);
        setTestName("");
        setTestTitle("");
        setTestStory("");
        setTestPassage("");
        loadTestimonies();
        setTimeout(() => setTestSuccess(false), 3000);
      } else {
        setTestError("Failed to share testimony");
      }
    } catch {
      setTestError("Connection error");
    } finally {
      setTestSubmitting(false);
    }
  };

  const handlePray = async (id: string) => {
    await fetch("/api/testimony", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "pray" }),
    });
    loadTestimonies();
  };

  const handleEncourage = async (id: string) => {
    await fetch("/api/testimony", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "encourage" }),
    });
    loadTestimonies();
  };

  // ── Render ─────────────────────────────────────────────────

  const tabs = [
    { key: "feed" as const, label: "📖 Community Feed", count: shares.length },
    { key: "testimonies" as const, label: "🙌 Testimonies", count: testimonies.length },
    { key: "prayer" as const, label: "🙏 Prayer Wall" },
    { key: "share" as const, label: "✏️ Share Something" },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] pt-6 px-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#c9d1d9] mb-6">👥 Community</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.key
                  ? "bg-[#1f6feb] text-white"
                  : "bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Feed tab ── */}
        {tab === "feed" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8"><Spinner /></div>
            ) : shares.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">📖</span>
                <p className="text-[#8b949e] text-sm mb-4">No shared studies yet. Be the first!</p>
                <button onClick={() => setTab("share")} className="px-4 py-2 bg-[#1f6feb] text-white rounded-lg text-sm">
                  Share a Study
                </button>
              </div>
            ) : (
              shares.map((share) => (
                <div key={share.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] capitalize">
                      {share.share_type === "study" ? "📖 Study" : "📔 Journal"}
                    </span>
                    {share.passage && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-[#58a6ff] font-mono">
                        {share.passage}
                      </span>
                    )}
                    {share.level && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e]">
                        L{share.level}
                      </span>
                    )}
                    <span className="text-xs text-[#484f58] ml-auto">
                      {new Date(share.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {share.title && <h3 className="text-sm font-semibold text-[#c9d1d9] mb-2">{share.title}</h3>}
                  <p className="text-[#8b949e] text-sm leading-relaxed whitespace-pre-line line-clamp-6">
                    {share.content}
                  </p>
                  {share.display_name && (
                    <p className="text-xs text-[#484f58] mt-3">— {share.display_name}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Testimonies tab ── */}
        {tab === "testimonies" && (
          <div className="space-y-4">
            {testimonies.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">🙌</span>
                <p className="text-[#8b949e] text-sm mb-4">No testimonies yet. Share what God has done!</p>
                <button onClick={() => setTab("share")} className="px-4 py-2 bg-[#1f6feb] text-white rounded-lg text-sm">
                  Share Your Testimony
                </button>
              </div>
            ) : (
              testimonies.map((t) => (
                <div key={t.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-[#a371f7]">🙌 Testimony</span>
                    {t.passage && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-[#58a6ff] font-mono">{t.passage}</span>
                    )}
                    <span className="text-xs text-[#484f58] ml-auto">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#c9d1d9] mb-2">{t.title}</h3>
                  <p className="text-[#8b949e] text-sm leading-relaxed whitespace-pre-line">{t.story}</p>
                  <p className="text-xs text-[#a371f7] mt-3">— {t.author_name}</p>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-[#21262d]">
                    <button
                      onClick={() => handlePray(t.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] transition-all"
                    >
                      🙏 Prayed ({t.prayers})
                    </button>
                    <button
                      onClick={() => handleEncourage(t.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] transition-all"
                    >
                      💛 Encourage ({t.encouragements})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Prayer Wall tab ── */}
        {tab === "prayer" && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">🙏</span>
            <h2 className="text-lg font-bold text-[#c9d1d9] mb-2">Prayer Wall</h2>
            <p className="text-[#8b949e] text-sm mb-6">
              Opt-in prayer requests from the community. Your prayer and struggle fields are NEVER shared by default — you must explicitly choose to share a prayer request.
            </p>
            <p className="text-xs text-[#f85149] bg-[rgba(248,81,73,0.08)] border border-[rgba(248,81,73,0.15)] rounded-lg p-3 max-w-md mx-auto">
              🔒 Your private prayers and struggles are always protected. Only content you explicitly mark for sharing appears here.
            </p>
          </div>
        )}

        {/* ── Share tab ── */}
        {tab === "share" && (
          <div className="space-y-6">
            {/* Share study/journal */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <h2 className="text-sm font-semibold text-[#c9d1d9] mb-4">📖 Share a Study Insight</h2>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <button onClick={() => setShareType("study")} className={`flex-1 py-2 rounded-lg text-xs font-medium ${shareType === "study" ? "bg-[#1f6feb] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>
                    📖 Study
                  </button>
                  <button onClick={() => setShareType("journal")} className={`flex-1 py-2 rounded-lg text-xs font-medium ${shareType === "journal" ? "bg-[#1f6feb] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>
                    📔 Journal
                  </button>
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] block mb-1">Your name (leave blank to share anonymously)</label>
                  <input value={shareName} onChange={e => setShareName(e.target.value)} placeholder="e.g. Thomas" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] block mb-1">Title</label>
                  <input value={shareTitle} onChange={e => setShareTitle(e.target.value)} placeholder="What did you learn?" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] block mb-1">Passage (optional)</label>
                  <input value={sharePassage} onChange={e => setSharePassage(e.target.value)} placeholder="e.g. John 3:16" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] block mb-1">Your insight</label>
                  <textarea value={shareContent} onChange={e => setShareContent(e.target.value)} rows={4} placeholder="Share what God showed you..." className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] resize-y" />
                </div>

                <label className="flex items-center gap-2 text-xs text-[#8b949e]">
                  <input type="checkbox" checked={shareAnon} onChange={e => setShareAnon(e.target.checked)} />
                  Share anonymously
                </label>

                {shareError && <p className="text-xs text-[#f85149]">{shareError}</p>}
                {shareSuccess && <p className="text-xs text-[#3fb950]">Shared successfully!</p>}

                <button onClick={handleShare} disabled={sharing} className="w-full py-2.5 bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                  {sharing ? <><Spinner /> Sharing...</> : "Share with Community"}
                </button>
              </div>
            </div>

            {/* Share testimony */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <h2 className="text-sm font-semibold text-[#c9d1d9] mb-4">🙌 Share a Testimony</h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#8b949e] block mb-1">Your name (or "Anonymous")</label>
                  <input value={testName} onChange={e => setTestName(e.target.value)} placeholder="Anonymous" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] block mb-1">Title *</label>
                  <input value={testTitle} onChange={e => setTestTitle(e.target.value)} placeholder="How God worked in your life" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] block mb-1">Key verse (optional)</label>
                  <input value={testPassage} onChange={e => setTestPassage(e.target.value)} placeholder="e.g. Romans 8:28" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]" />
                </div>

                <div>
                  <label className="text-xs text-[#8b949e] block mb-1">Your story *</label>
                  <textarea value={testStory} onChange={e => setTestStory(e.target.value)} rows={5} placeholder="Share what God has done..." className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] text-sm placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] resize-y" />
                </div>

                {testError && <p className="text-xs text-[#f85149]">{testError}</p>}
                {testSuccess && <p className="text-xs text-[#3fb950]">Testimony shared!</p>}

                <button onClick={handleTestimony} disabled={testSubmitting} className="w-full py-2.5 bg-[#a371f7] hover:bg-[#b388f7] disabled:bg-[#21262d] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                  {testSubmitting ? <><Spinner /> Sharing...</> : "Share Testimony"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
